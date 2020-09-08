var documenterSearchIndex = {"docs":
[{"location":"#Kaleido.jl-1","page":"Home","title":"Kaleido.jl","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"Pages = [\"index.md\"]","category":"page"},{"location":"#","page":"Home","title":"Home","text":"Kaleido","category":"page"},{"location":"#Kaleido","page":"Home","title":"Kaleido","text":"Kaleido: some useful lenses\n\n(Image: Stable) (Image: Dev) (Image: Build Status) (Image: Codecov) (Image: Coveralls) (Image: Aqua QA) (Image: GitHub commits since tagged version)\n\nKaleido.jl is a collection of useful Lenses and helper functions/macros built on top of Setfield.jl.\n\nFeatures\n\nSummary\n\nBatched/multi-valued update.  See @batchlens, MultiLens.\nGet/set multiple and nested fields as a StaticArray or any arbitrary multi-valued container.  See getting.\nGet/set fields with different parametrizations. See converting, setting, getting.\nComputing other fields during set and get; i.e., adding constraints between fields.  See constraining.\nGet/set dynamically computed locations.  See FLens.\n\nBatched/multi-valued update\n\nMacro @batchlens can be used to update various nested locations in a complex immutable object:\n\njulia> using Setfield, Kaleido\n\njulia> lens_batch = @batchlens begin\n           _.a.b.c\n           _.a.b.d[1]\n           _.a.b.d[3] ∘ settingas𝕀\n           _.a.e\n       end;\n\njulia> obj = (a = (b = (c = 1, d = (2, 3, 0.5)), e = 5),);\n\njulia> get(obj, lens_batch)\n(1, 2, 0.0, 5)\n\njulia> set(obj, lens_batch, (10, 20, Inf, 50))\n(a = (b = (c = 10, d = (20, 3, 1.0)), e = 50),)\n\n(See below for what settingas𝕀 does.)\n\nGet/set multiple and nested fields as a StaticArray\n\nIt is often useful to get the values of the fields as a vector (e.g., when optimizing a composite object with Optim.jl).  This can be done with getting(f) where f is a constructor.\n\njulia> using StaticArrays\n\njulia> lens_vec = lens_batch ∘ getting(SVector);\n\njulia> @assert get(obj, lens_vec) === SVector(1, 2, 0.0, 5)\n\njulia> set(obj, lens_vec, SVector(10, 20, Inf, 50))\n(a = (b = (c = 10.0, d = (20.0, 3, 1.0)), e = 50.0),)\n\nGet/set fields with different parametrizations\n\nKaleido.jl comes with lenses settingasℝ₊, settingasℝ₋, and settingas𝕀 to manipulating fields that have to be restricted to be positive, negative, and in [0, 1] interval, respectively.  Similarly there are lenses gettingasℝ₊, gettingasℝ₋, and gettingas𝕀 to get values in those domains.  The naming is borrowed from TransformVariables.jl.\n\njulia> lens = (@lens _.x) ∘ settingasℝ₊;\n\njulia> get((x=1.0,), lens)  # log(1.0)\n0.0\n\njulia> set((x=1.0,), lens, -Inf)\n(x = 0.0,)\n\nKaleido.jl also works with AbstractTransform defined in TransformVariables.jl:\n\njulia> using TransformVariables\n\njulia> lens = (@lens _.y[2]) ∘ setting(as𝕀);\n\njulia> obj = (x=0, y=(1, 0.5, 3));\n\njulia> get(obj, lens)\n0.0\n\njulia> @assert set(obj, lens, Inf).y[2] ≈ 1\n\nIt also is quite easy to define ad-hoc converting accessors using converting:\n\njulia> lens = (@lens _.y[2]) ∘\n           converting(fromfield=x -> parse(Int, x), tofield=string);\n\njulia> obj = (x=0, y=(1, \"5\", 3));\n\njulia> get(obj, lens)\n5\n\njulia> set(obj, lens, 1)\n(x = 0, y = (1, \"1\", 3))\n\nComputing other fields during set and get\n\nIt is easy to add constraints between fields using constraining. For example, you can impose that field .c must be a sum of .a and .b by:\n\njulia> obj = (a = 1, b = 2, c = 3);\n\njulia> constraint = constraining() do obj\n           @set obj.c = obj.a + obj.b\n       end;\n\njulia> lens = constraint ∘ MultiLens((\n           (@lens _.a),\n           (@lens _.b),\n       ));\n\njulia> get(obj, lens)\n(1, 2)\n\njulia> set(obj, lens, (100, 20))\n(a = 100, b = 20, c = 120)\n\nNotice that .c is updated as well in the last line.\n\nGet/set dynamically computed locations\n\nYou can use FLens to get and set, e.g., the last entry of a linked list.\n\n\n\n\n\n","category":"module"},{"location":"#Setting/getting-multiple-locations-1","page":"Home","title":"Setting/getting multiple locations","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"Kaleido.@batchlens\nKaleido.batch\nKaleido.MultiLens\nKaleido.PropertyBatchLens\nKaleido.KeyBatchLens\nKaleido.IndexBatchLens\nKaleido.FlatLens","category":"page"},{"location":"#Kaleido.@batchlens","page":"Home","title":"Kaleido.@batchlens","text":"@batchlens begin\n    lens_expression_1\n    lens_expression_2\n    ...\n    lens_expression_n\nend\n\nFrom n \"lens expression\", create a lens that gets/sets n-tuple. Each \"lens expression\" is an expression that is supported by Setfield.@lens or such expression post-composed with other lenses using ∘.\n\nSee also batch which does all the heavy lifting of the transformation of the lenses.\n\nExamples\n\njulia> using Kaleido, Setfield\n\njulia> lens = @batchlens begin\n           _.a.b.c\n           _.a.b.d ∘ converting(fromfield = x -> parse(Int, x), tofield = string)\n           _.a.e\n       end;\n\njulia> obj = (a = (b = (c = 1, d = \"2\"), e = 3),);\n\njulia> get(obj, lens)\n(1, 2, 3)\n\njulia> set(obj, lens, (10, 20, 30))\n(a = (b = (c = 10, d = \"20\"), e = 30),)\n\n\n\n\n\n","category":"macro"},{"location":"#Kaleido.batch","page":"Home","title":"Kaleido.batch","text":"batch(lens₁, lens₂, ..., lensₙ) :: Lens\n\nFrom n lenses, create a single lens that gets/sets n-tuple in such a way that the number of call to the constructor is minimized. This is done by calling IndexBatchLens whenever possible.\n\nExamples\n\njulia> using Kaleido, Setfield\n\njulia> lens = @batchlens begin\n           _.a.b.c\n           _.a.b.d\n           _.a.e\n       end;\n\njulia> @assert lens ==\n           IndexBatchLens(:a) ∘ MultiLens((\n               (@lens _[1]) ∘ IndexBatchLens(:b, :e) ∘ MultiLens((\n                   (@lens _[1]) ∘ IndexBatchLens(:c, :d),\n                   (@lens _[2]) ∘ Kaleido.SingletonLens(),\n               )) ∘ FlatLens(2, 1),\n           )) ∘ FlatLens(3)\n\njulia> obj = (a=(b=(c=1, d=2), e=3),);\n\njulia> get(obj, lens)\n(1, 2, 3)\n\njulia> set(obj, lens, (10, 20, 30))\n(a = (b = (c = 10, d = 20), e = 30),)\n\n\n\n\n\n","category":"function"},{"location":"#Kaleido.MultiLens","page":"Home","title":"Kaleido.MultiLens","text":"MultiLens([castout,] lenses::Tuple)\nMultiLens([castout,] lenses::NamedTuple)\n\nExamples\n\njulia> using Setfield, Kaleido\n\njulia> ml = MultiLens((\n           (@lens _.x),\n           (@lens _.y.z),\n       ))\n〈◻.x, ◻.y.z〉\n\njulia> get((x=1, y=(z=2,)), ml)\n(1, 2)\n\njulia> set((x=1, y=(z=2,)), ml, (\"x\", \"y.z\"))\n(x = \"x\", y = (z = \"y.z\",))\n\njulia> ml = MultiLens((\n           a = (@lens _.x),\n           b = (@lens _.y.z),\n       ))\n〈◻.x, ◻.y.z〉\n\njulia> get((x=1, y=(z=2,)), ml)\n(a = 1, b = 2)\n\njulia> set((x=1, y=(z=2,)), ml, (a=:x, b=\"y.z\"))\n(x = :x, y = (z = \"y.z\",))\n\njulia> set((x=1, y=(z=2,)), ml, (b=\"y.z\", a=:x))\n(x = :x, y = (z = \"y.z\",))\n\njulia> using StaticArrays\n\njulia> ml = MultiLens(\n           SVector,\n           (\n               (@lens _.x),\n               (@lens _.y.z),\n           )\n       )\n〈◻.x, ◻.y.z〉\n\njulia> @assert get((x=1, y=(z=2,)), ml) === SVector(1, 2)\n\n\n\n\n\n","category":"type"},{"location":"#Kaleido.PropertyBatchLens","page":"Home","title":"Kaleido.PropertyBatchLens","text":"PropertyBatchLens(names)\n\nExamples\n\njulia> using Setfield, Kaleido\n\njulia> lens = PropertyBatchLens(:a, :b, :c);\n\njulia> get((a=1, b=2, c=3, d=4), lens)\n(a = 1, b = 2, c = 3)\n\njulia> set((a=1, b=2, c=3, d=4), lens, (a=10, b=20, c=30))\n(a = 10, b = 20, c = 30, d = 4)\n\n\n\n\n\n","category":"type"},{"location":"#Kaleido.KeyBatchLens","page":"Home","title":"Kaleido.KeyBatchLens","text":"KeyBatchLens(names)\n\nExamples\n\njulia> using Setfield, Kaleido\n\njulia> lens = KeyBatchLens(:a, :b, :c);\n\njulia> get((a=1, b=2, c=3, d=4), lens)\n(a = 1, b = 2, c = 3)\n\njulia> set((a=1, b=2, c=3, d=4), lens, Dict(:a=>10, :b=>20, :c=>30))\n(a = 10, b = 20, c = 30, d = 4)\n\n\n\n\n\n","category":"type"},{"location":"#Kaleido.IndexBatchLens","page":"Home","title":"Kaleido.IndexBatchLens","text":"IndexBatchLens(names)\n\nExamples\n\njulia> using Setfield, Kaleido\n\njulia> lens = IndexBatchLens(:a, :b, :c);\n\njulia> get((a=1, b=2, c=3, d=4), lens)\n(1, 2, 3)\n\njulia> set((a=1, b=2, c=3, d=4), lens, (10, 20, 30))\n(a = 10, b = 20, c = 30, d = 4)\n\n\n\n\n\n","category":"type"},{"location":"#Kaleido.FlatLens","page":"Home","title":"Kaleido.FlatLens","text":"FlatLens(N₁, N₂, ..., Nₙ)\n\nExamples\n\njulia> using Setfield, Kaleido\n\njulia> l = MultiLens((\n           (@lens _.x) ∘ IndexBatchLens(:a, :b, :c),\n           (@lens _.y) ∘ IndexBatchLens(:d, :e),\n       )) ∘ FlatLens(3, 2);\n\njulia> get((x=(a=1, b=2, c=3), y=(d=4, e=5)), l)\n(1, 2, 3, 4, 5)\n\njulia> set((x=(a=1, b=2, c=3), y=(d=4, e=5)), l, (10, 20, 30, 40, 50))\n(x = (a = 10, b = 20, c = 30), y = (d = 40, e = 50))\n\n\n\n\n\n","category":"type"},{"location":"#Bijective-transformations-as-lenses-1","page":"Home","title":"Bijective transformations as lenses","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"Kaleido.converting\nKaleido.setting\nKaleido.getting\nKaleido.settingasℝ₊\nKaleido.settingasℝ₋\nKaleido.settingas𝕀","category":"page"},{"location":"#Kaleido.converting","page":"Home","title":"Kaleido.converting","text":"converting(; fromfield, tofield) :: Lens\n\nExamples\n\njulia> using Setfield, Kaleido\n\njulia> halve(x) = x / 2;\n\njulia> double(x) = 2x;\n\njulia> l = (@lens _.y[2]) ∘ converting(fromfield = halve, tofield = double)\n(@lens _.y[2]) ∘ (←double|halve→)\n\njulia> obj = (x=0, y=(1, 2, 3));\n\njulia> @assert get(obj, l) == 1.0 == 2/2\n\njulia> set(obj, l, 0.5)\n(x = 0, y = (1, 1.0, 3))\n\n\n\n\n\n","category":"function"},{"location":"#Kaleido.setting","page":"Home","title":"Kaleido.setting","text":"setting(xf::TransformVariables.AbstractTransform) :: Lens\n\nLens to set value transformed by xf (and get value via the inverse transformation).\n\nExamples\n\njulia> using Setfield, Kaleido, TransformVariables\n\njulia> l = (@lens _.y[2]) ∘ setting(as𝕀)\n(@lens _.y[2]) ∘ (←|as𝕀→)\n\njulia> obj = (x=0, y=(1, 0.5, 3));\n\njulia> get(obj, l)\n0.0\n\njulia> @assert set(obj, l, Inf).y[2] ≈ 1\n\njulia> @assert set(obj, l, -Inf).y[2] ≈ 0.0\n\n\n\n\n\n","category":"function"},{"location":"#Kaleido.getting","page":"Home","title":"Kaleido.getting","text":"getting(xf::TransformVariables.AbstractTransform) :: Lens\n\nLens to get value transformed by xf (and set value via the inverse transformation).\n\n\n\n\n\n","category":"function"},{"location":"#Kaleido.settingasℝ₊","page":"Home","title":"Kaleido.settingasℝ₊","text":"settingasℝ₊ :: BijectionLens\n\nThis is a stripped-down version of setting(asℝ₊) that works without TransformVariables.jl.\n\nExamples\n\njulia> using Setfield, Kaleido\n\njulia> l = (@lens _.y[2]) ∘ settingasℝ₊\n(@lens _.y[2]) ∘ (←exp|log→)\n\njulia> obj = (x=0, y=(0, 1, 2));\n\njulia> @assert get(obj, l) == 0.0 == log(obj.y[2])\n\njulia> @assert set(obj, l, -1) == (x=0, y=(0, exp(-1), 2))\n\n\n\n\n\n","category":"constant"},{"location":"#Kaleido.settingasℝ₋","page":"Home","title":"Kaleido.settingasℝ₋","text":"settingasℝ₋ :: BijectionLens\n\nThis is a stripped-down version of setting(asℝ₋) that works without TransformVariables.jl.\n\nExamples\n\njulia> using Setfield, Kaleido\n\njulia> l = (@lens _.y[2]) ∘ settingasℝ₋\n(@lens _.y[2]) ∘ (←negexp|logneg→)\n\njulia> obj = (x=0, y=(0, -1, 2));\n\njulia> @assert get(obj, l) == 0.0 == log(-obj.y[2])\n\njulia> @assert set(obj, l, 1) == (x=0, y=(0, -exp(1), 2))\n\n\n\n\n\n","category":"constant"},{"location":"#Kaleido.settingas𝕀","page":"Home","title":"Kaleido.settingas𝕀","text":"settingas𝕀 :: BijectionLens\n\nThis is a stripped-down version of setting(as𝕀) that works without TransformVariables.jl.\n\nExamples\n\njulia> using Setfield, Kaleido\n\njulia> l = (@lens _.y[2]) ∘ settingas𝕀\n(@lens _.y[2]) ∘ (←logistic|logit→)\n\njulia> obj = (x=0, y=(0, 0.5, 2));\n\njulia> get(obj, l)\n0.0\n\njulia> @assert set(obj, l, Inf).y[2] ≈ 1\n\njulia> @assert set(obj, l, -Inf).y[2] ≈ 0\n\n\n\n\n\n","category":"constant"},{"location":"#Misc-lenses-1","page":"Home","title":"Misc lenses","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"Kaleido.getting(::Any)\nKaleido.constraining\nKaleido.FLens","category":"page"},{"location":"#Kaleido.getting-Tuple{Any}","page":"Home","title":"Kaleido.getting","text":"getting(f) :: Lens\n\nApply a callable f (typically a type constructor) before getting the value; i.e.,\n\nget(obj, lens ∘ getting(f)) == f(get(obj, lens))\n\nThis is useful for, e.g., getting a tuple as a StaticVector and converting it back to a tuple when setting.\n\nNote that getting requires some properties for f and the values stored in the \"field.\"  See the details below.\n\nExamples\n\njulia> using Kaleido, Setfield, StaticArrays\n\njulia> obj = (x = ((0, 1, 2), \"A\"), y = \"B\");\n\njulia> lens = (@lens _.x[1]) ∘ getting(SVector)\n(@lens _.x[1]) ∘ (←|SArray{Tuple{S},T,1,S} where T where S→)\n\njulia> get(obj, lens) === SVector(obj.x[1])\ntrue\n\njulia> set(obj, lens, SVector(3, 4, 5))\n(x = ((3, 4, 5), \"A\"), y = \"B\")\n\njulia> using Kaleido, Setfield, StaticArrays\n\njulia> obj = (x = ((a = 0, b = 1, c = 2), \"A\"), y = \"B\");\n\njulia> lens = (@lens _.x[1]) ∘ getting(Base.splat(SVector))\n(@lens _.x[1]) ∘ (←|#60→)\n\njulia> get(obj, lens) === SVector(obj.x[1]...)\ntrue\n\njulia> set(obj, lens, SVector(3, 4, 5))\n(x = ((a = 3, b = 4, c = 5), \"A\"), y = \"B\")\n\nDetails\n\nThe lens created by getting(f) relies on that:\n\nThe output value y = f(x) can be converted back to the original value x by C(y) where C is a constructor of x; i.e., for any x that could be retrieved from the object through this lens,\nC(f(x)) == x\nThe conversion in the reverse direction also holds; i.e., for any y that could be stored into the object through this lens,\nf(C(y)) == y\n\nThe constructor C can be controlled by defining Setfield.constructor_of for custom types of x.\n\n\n\n\n\n","category":"method"},{"location":"#Kaleido.constraining","page":"Home","title":"Kaleido.constraining","text":"constraining(f; onget=true, onset=true)\n\nCreate a lens to impose constraints by a callable f.\n\nThe callable f must be idempotent; i.e., f ∘ f = f.\nIf the original object already satisfies the constraint (i.e. f(obj) == obj), onget=false can be passed safely to skip calling f during get.\n\nExamples\n\njulia> using Kaleido, Setfield\n\njulia> obj = (a = 1, b = 1);\n\njulia> constraint = constraining() do obj\n           @set obj.b = obj.a\n       end\nconstraining(#1)\n\njulia> lens = constraint ∘ @lens _.a\nconstraining(#1) ∘ (@lens _.a)\n\njulia> get(obj, lens)\n1\n\njulia> set(obj, lens, 2)\n(a = 2, b = 2)\n\nconstraining is useful when combined with @batchlens or MultiLens:\n\njulia> using Kaleido, Setfield\n\njulia> obj = (a = 1, b = 2, c = 3);\n\njulia> constraint = constraining() do obj\n           @set obj.c = obj.a + obj.b\n       end;\n\njulia> lens = constraint ∘ MultiLens((\n           (@lens _.a),\n           (@lens _.b),\n       ));\n\njulia> get(obj, lens)\n(1, 2)\n\njulia> set(obj, lens, (100, 20))\n(a = 100, b = 20, c = 120)\n\n\n\n\n\n","category":"function"},{"location":"#Kaleido.FLens","page":"Home","title":"Kaleido.FLens","text":"FLens(functor_based_lens) :: Lens\n\nFLens provides an alternative (\"isomorphic\") way to create a Lens. It is useful for accessing dynamically determined \"field\" such as the last item in the linked list.\n\n(Note: it's probably better to look at Examples first.)\n\nFLens converts functor_based_lens (a two-argument callable) to the Lens defined in Setfield.  The callable functor_based_lens accepts the following two arguments:\n\nsetter: a one-argument callable that accepts a value in the \"field\" and return an object that can be passed to the second argument of Kaleido.fmap.\nobj: an object whose \"field\" is accessed.\n\nInformally the signature of the functions appeared above may be written as\n\nFLens(functor_based_lens) :: Lens\nfunctor_based_lens(setter, obj)\nsetter(field::A) :: F{A} where {F <: Functor}\nfmap(f, ::F{A}) :: F{B} where {F <: Functor}\nf(field::A) :: B\n\n(note: there is no Functor in actual code)\n\nExamples\n\nHere is an implementation of @lens _[1] using FLens\n\njulia> using Setfield\n\njulia> using Kaleido: FLens, fmap\n\njulia> fst = FLens((f, obj) -> fmap(x -> (x, obj[2:end]...), f(obj[1])));\n\njulia> get((1, 2, 3), fst)\n1\n\njulia> set((1, 2, 3), fst, 100)\n(100, 2, 3)\n\nA typical FLens usage has the form\n\nFLens((f, obj) -> fmap(x -> SET(obj, x), f(GET(obj))))\n\nwhere\n\nSET(obj, x) sets the \"field\" of the obj to the value x.\nGET(obj) gets the value of the \"field.\"\n\nWhat GET and SET does may look like similar to Setfield.get and Setfield.set.  In fact, any lens can be converted into FLens:\n\njulia> using Setfield\n\njulia> using Kaleido: FLens, fmap\n\njulia> asflens(lens::Lens) =\n           FLens((f, obj) -> fmap(x -> set(obj, lens, x), f(get(obj, lens))));\n\njulia> dot_a = asflens(@lens _.a);\n\njulia> get((a=1, b=2), dot_a)\n1\n\njulia> set((a=1, b=2), dot_a, 100)\n(a = 100, b = 2)\n\nIf FLens is \"isomorphic\" to usual Lens, why not directly define Setfield.get and Setfield.set?  (They are easier to understand.)\n\nThis is because FLens is useful if the \"field\" of interest can only be dynamically determined.  For example, a lens to the last item of linked lists can be defined as follows:\n\njulia> using Setfield\n\njulia> using Kaleido: FLens, fmap\n\njulia> struct Cons{T, S}\n           car::T\n           cdr::S\n       end\n\njulia> last_impl(f, list, g) =\n           if list.cdr === nothing\n               h = x -> g(Cons(x, nothing))\n               fmap(h, f(list.car))\n           else\n               h = x -> g(Cons(list.car, x))\n               last_impl(f, list.cdr, h)\n           end;\n\njulia> lst = FLens((f, list) -> last_impl(f, list, identity));\n\njulia> list = Cons(1, Cons(2, Cons(3, nothing)));\n\njulia> get(list, lst)\n3\n\njulia> set(list, lst, :last) === Cons(1, Cons(2, Cons(:last, nothing)))\ntrue\n\nNotice that last_impl dynamically builds the closure h that is passed as the first argument of fmap.  Although it is possible to implement the same lens by directly defining Setfield.get and Setfield.set, those two functions would have duplicated code for recursing into the last item.\n\nAnother (marginal?) benefit is that FLens can be more efficient when using modify.  This is because FLens can do modify in one recursion into the \"field\" while two recursions are necessary with get and set.  It can be relevant especially with complex object and lens where get and set used in modify cannot be inlined (e.g., due to type instability).\n\nFLens can also be used for imposing some constraints in the fields. However, it may be better to use constraining for this purpose.\n\njulia> using Setfield\n\njulia> using Kaleido: FLens, fmap\n\njulia> fstsnd = FLens((f, obj) -> fmap(\n           x -> (x, x, obj[3:end]...),\n           begin\n               @assert obj[1] == obj[2]\n               f(obj[1])\n           end,\n       ));\n\njulia> get((1, 1, 2), fstsnd)\n1\n\njulia> set((1, 1, 2), fstsnd, 100)\n(100, 100, 2)\n\nSide notes\n\nFLens mimics the formalism used in the lens in Haskell. For an introduction to lens, the talk Lenses: compositional data access and manipulation by Simon Peyton Jones is highly recommended.  In this talk, a simplified form of lens uses in Haskell is explained in details:\n\ntype Lens' s a = forall f. Functor f\n                        => (a -> f a) -> s -> f s\n\nInformally, this type synonym maps to the signature of FLens:\n\nFLens(((::A -> ::F{A}), ::S) -> ::F{S} where F <: Functor) :: Lens\n\n\n\n\n\n","category":"type"},{"location":"#Setters-1","page":"Home","title":"Setters","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"Kaleido.nullsetter\nKaleido.ToField","category":"page"},{"location":"#Kaleido.nullsetter","page":"Home","title":"Kaleido.nullsetter","text":"nullsetter :: Setter\n\nA setter that does nothing; i.e., set(x, nullsetter, y) === x for any x and y.\n\nExamples\n\njulia> using Setfield, Kaleido\n\njulia> set(1, nullsetter, 2)\n1\n\n\n\n\n\n","category":"constant"},{"location":"#Kaleido.ToField","page":"Home","title":"Kaleido.ToField","text":"ToField(f) :: Setter\n\nApply f when setting.  Use x -> get(x, f) if f is a Lens.\n\nExamples\n\njulia> using Setfield, Kaleido\n\njulia> setter = (@lens _.x) ∘ ToField(@lens _.a)\n(@lens _.x) ∘ (←(@lens _.a)|❌→)\n\njulia> set((x = 1, y = 2), setter, (a = 10, b = 20))\n(x = 10, y = 2)\n\n\n\n\n\n","category":"type"},{"location":"#Utilities-1","page":"Home","title":"Utilities","text":"","category":"section"},{"location":"#","page":"Home","title":"Home","text":"Kaleido.prettylens","category":"page"},{"location":"#Kaleido.prettylens","page":"Home","title":"Kaleido.prettylens","text":"prettylens(lens::Lens; sprint_kwargs...) :: String\nprettylens(io::IO, lens::Lens)\n\nPrint or return more compact and easier-to-read string representation of lens than show.\n\nExamples\n\njulia> using Setfield, Kaleido\n\njulia> prettylens(\n           (@lens _.a) ∘ MultiLens((\n               (@lens last(_)),\n               (@lens _[:c].d) ∘ settingasℝ₊,\n           ));\n           context = :compact => true,\n       )\n\"◻.a∘〈last(◻),◻[:c].d∘(←exp|log→)〉\"\n\n\n\n\n\n","category":"function"},{"location":"internals/#Internals-1","page":"Internals","title":"Internals","text":"","category":"section"},{"location":"internals/#","page":"Internals","title":"Internals","text":"Modules = [Kaleido]\nPublic = false","category":"page"},{"location":"internals/#Kaleido.KaleidoLens","page":"Internals","title":"Kaleido.KaleidoLens","text":"KaleidoLens <: Lens\n\nInternal abstract type for Kaleido.jl.\n\n\n\n\n\n","category":"type"},{"location":"internals/#Kaleido.SingletonLens","page":"Internals","title":"Kaleido.SingletonLens","text":"SingletonLens()\n\nInverse of FlatLens(1).\n\n\n\n\n\n","category":"type"},{"location":"internals/#Kaleido._compose-Tuple{Setfield.Lens,Setfield.Lens}","page":"Internals","title":"Kaleido._compose","text":"_compose(lens1, lens2)\n\nLike ∘ but fixes the associativity to match with the default one in Setfield.\n\n\n\n\n\n","category":"method"},{"location":"internals/#Kaleido.prefer_singleton_callable-Union{Tuple{Type{T}}, Tuple{T}} where T","page":"Internals","title":"Kaleido.prefer_singleton_callable","text":"prefer_singleton_callable(f)\n\nConvert f to an callable singleton object if possible.  Useful if f is a Type.\n\nExamples\n\njulia> using Kaleido: prefer_singleton_callable\n\njulia> sizeof((Int,))\n8\n\njulia> sizeof((prefer_singleton_callable(Int),))\n0\n\njulia> prefer_singleton_callable(Int)(1.0)\n1\n\n\n\n\n\n","category":"method"}]
}
