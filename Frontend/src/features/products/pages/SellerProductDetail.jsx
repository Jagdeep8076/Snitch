import React, { useEffect, useState, useRef } from 'react'
import { useProduct } from '../hook/useProduct.js'
import { useParams, useNavigate } from 'react-router-dom'

const SellerProductDetail = () => {
    const { productId } = useParams()
    const navigate = useNavigate()
    const { handleGetProductById, handleAddProductVariant, handleUpdateVariantStock, handleUpdateProductBasePrice, handleUpdateVariantPrice } = useProduct()

    const [product, setProduct] = useState(null)
    const [activeImage, setActiveImage] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    // Base Price editing state
    const [isEditingBasePrice, setIsEditingBasePrice] = useState(false);
    const [editingBasePriceValue, setEditingBasePriceValue] = useState("");
    const [editingBasePriceMrp, setEditingBasePriceMrp] = useState("");
    const [isUpdatingBasePrice, setIsUpdatingBasePrice] = useState(false);

    // Variant Price editing state
    const [editingPriceVariantId, setEditingPriceVariantId] = useState(null);
    const [editingPriceVariantValue, setEditingPriceVariantValue] = useState("");
    const [editingPriceVariantMrp, setEditingPriceVariantMrp] = useState("");
    const [isUpdatingVariantPrice, setIsUpdatingVariantPrice] = useState(false);

    // Stock editing state
    const [editingStockId, setEditingStockId] = useState(null);
    const [editingStockValue, setEditingStockValue] = useState("");
    const [isUpdatingStock, setIsUpdatingStock] = useState(false);

    // Variant Form State
    const [isVariantFormOpen, setIsVariantFormOpen] = useState(false)
    const [isSubmittingVariant, setIsSubmittingVariant] = useState(false)
    const [newVariant, setNewVariant] = useState({
        images: Array(7).fill(null),
        stock: "",
        price: { amount: "", currency: "INR", mrp: "" },
        attributes: {}
    })
    const [attrKey, setAttrKey] = useState("")
    const [attrValue, setAttrValue] = useState("")

    const handleAddVariantImage = (index, file) => {
        setNewVariant(prev => {
            const newImages = [...prev.images];
            newImages[index] = { file, url: URL.createObjectURL(file) };
            return { ...prev, images: newImages };
        });
    }

    const handleRemoveVariantImage = (index) => {
        setNewVariant(prev => {
            const newImages = [...prev.images];
            newImages[index] = null;
            return { ...prev, images: newImages };
        });
    }

    const handleAddAttribute = () => {
        if (attrKey && attrValue) {
            setNewVariant(prev => ({
                ...prev,
                attributes: {
                    ...prev.attributes,
                    [attrKey]: attrValue
                }
            }))
            setAttrKey("")
            setAttrValue("")
        }
    }

    const handleRemoveAttribute = (keyToRemove) => {
        setNewVariant(prev => {
            const newAttrs = { ...prev.attributes }
            delete newAttrs[keyToRemove]
            return { ...prev, attributes: newAttrs }
        })
    }

    const handleSaveVariant = async (e) => {
        e.preventDefault()
        setIsSubmittingVariant(true)
        try {
            const data = await handleAddProductVariant(productId, newVariant)
            setProduct(prev => {
                const updated = { ...prev }
                if (!updated.variants) updated.variants = []
                if (data?.variant) {
                    updated.variants.push(data.variant)
                } else if (data?.product) {
                    updated.variants = data.product.variants
                }
                return updated
            })
            setIsVariantFormOpen(false)
            setNewVariant({
                images: Array(7).fill(null),
                stock: "",
                price: { amount: "", currency: "INR", mrp: "" },
                attributes: {}
            })
        } catch (error) {
            console.error("Failed to add variant", error)
        } finally {
            setIsSubmittingVariant(false)
        }
    }

    const handleSaveStock = async (variantId) => {
        setIsUpdatingStock(true);
        try {
            const data = await handleUpdateVariantStock(productId, variantId, editingStockValue);
            if (data?.success) {
                setProduct(prev => {
                    const updated = { ...prev };
                    const vIndex = updated.variants.findIndex(v => v._id === variantId);
                    if (vIndex !== -1 && data.variant) {
                        updated.variants[vIndex] = data.variant;
                    }
                    return updated;
                });
                setEditingStockId(null);
            }
        } catch (error) {
            console.error("Failed to update stock", error);
        } finally {
            setIsUpdatingStock(false);
        }
    };

    const handleSaveBasePrice = async () => {
        setIsUpdatingBasePrice(true);
        try {
            const data = await handleUpdateProductBasePrice(productId, editingBasePriceValue, product.price?.currency, editingBasePriceMrp);
            if (data?.success) {
                setProduct(prev => ({
                    ...prev,
                    price: data.product.price
                }));
                setIsEditingBasePrice(false);
            }
        } catch (error) {
            console.error("Failed to update base price", error);
            alert(error?.response?.data?.message || "Failed to update base price");
        } finally {
            setIsUpdatingBasePrice(false);
        }
    };

    const handleSaveVariantPrice = async (variantId) => {
        setIsUpdatingVariantPrice(true);
        try {
            const data = await handleUpdateVariantPrice(productId, variantId, editingPriceVariantValue, product.price?.currency, editingPriceVariantMrp);
            if (data?.success) {
                setProduct(prev => {
                    const updated = { ...prev };
                    const vIndex = updated.variants.findIndex(v => v._id === variantId);
                    if (vIndex !== -1 && data.variant) {
                        updated.variants[vIndex] = data.variant;
                    }
                    return updated;
                });
                setEditingPriceVariantId(null);
            }
        } catch (error) {
            console.error("Failed to update variant price", error);
            alert(error?.response?.data?.message || "Failed to update variant price");
        } finally {
            setIsUpdatingVariantPrice(false);
        }
    };

    async function fetchProductDetails() {
        setIsLoading(true)

        try {
            const data = await handleGetProductById(productId)
            const productData = data?.product || data

            setProduct(productData)

            if (productData?.images?.length > 0) {
                setActiveImage(productData.images[0].url)
            }
        } catch (error) {
            console.error("Failed to fetch product", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleNextImage = () => {
        if (!product?.images?.length) return

        const currentIndex = product.images.findIndex(
            img => img.url === activeImage
        )

        const nextIndex =
            (currentIndex + 1) % product.images.length

        setActiveImage(product.images[nextIndex].url)
    }

    const handlePrevImage = () => {
        if (!product?.images?.length) return

        const currentIndex = product.images.findIndex(
            img => img.url === activeImage
        )

        const prevIndex =
            (currentIndex - 1 + product.images.length) %
            product.images.length

        setActiveImage(product.images[prevIndex].url)
    }

    useEffect(() => {
        fetchProductDetails()
    }, [productId])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-on-surface gap-4 font-[Plus_Jakarta_Sans] antialiased">
                <p className="text-xl font-medium text-outline">
                    Product not found
                </p>

                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 rounded-full bg-surface-container text-on-surface border border-surface-container-high hover:bg-surface-container-high transition-colors font-semibold"
                >
                    Go Back
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-on-surface py-12 px-4 font-[Plus_Jakarta_Sans] antialiased">

            <div className="max-w-6xl mx-auto">

                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 text-sm text-outline hover:text-on-surface transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
                    Back
                </button>

                <div className="grid lg:grid-cols-2 gap-10">

                    <div>

                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-container border border-surface-container-high">

                            {activeImage && (
                                <img
                                    src={activeImage}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {product.images?.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface-container-low/80 backdrop-blur-sm flex items-center justify-center text-on-surface border border-surface-container-high hover:bg-surface-container transition-colors"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
                                    </button>

                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface-container-low/80 backdrop-blur-sm flex items-center justify-center text-on-surface border border-surface-container-high hover:bg-surface-container transition-colors"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
                                    </button>
                                </>
                            )}

                        </div>

                        <div className="flex gap-3 mt-4 overflow-x-auto">

                            {product.images?.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() =>
                                        setActiveImage(image.url)
                                    }
                                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                                        activeImage === image.url
                                            ? "border-primary ring-1 ring-primary/50"
                                            : "border-surface-container-high hover:border-outline"
                                    }`}
                                >
                                    <img
                                        src={image.url}
                                        alt={`Product ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}

                        </div>

                    </div>

                    <div className="flex flex-col justify-center">

                        <p className="text-xs uppercase tracking-[0.25em] text-secondary font-semibold mb-4">
                            Seller Product
                        </p>

                        <h1 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
                            {product.title}
                        </h1>

                        <div className="mb-6">
                            <div className="flex items-center gap-2">
                                <span>{product.price?.currency}</span>
                                {isEditingBasePrice ? (
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col gap-1">
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Selling Price"
                                                className="w-32 h-10 bg-background border border-surface-container-high rounded px-2 outline-none text-lg"
                                                value={editingBasePriceValue}
                                                onChange={(e) => setEditingBasePriceValue(e.target.value)}
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="MRP (Optional)"
                                                className="w-32 h-10 bg-background border border-surface-container-high rounded px-2 outline-none text-sm"
                                                value={editingBasePriceMrp}
                                                onChange={(e) => setEditingBasePriceMrp(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={handleSaveBasePrice}
                                                disabled={isUpdatingBasePrice}
                                                className="px-3 py-1 bg-primary text-on-primary rounded text-sm font-bold hover:opacity-90 disabled:opacity-50"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setIsEditingBasePrice(false)}
                                                disabled={isUpdatingBasePrice}
                                                className="px-3 py-1 bg-surface-container-high text-on-surface rounded text-sm font-bold hover:bg-surface-container-highest"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-semibold">{product.price?.amount?.toLocaleString()}</span>
                                            {product.price?.mrp > product.price?.amount && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-outline line-through">{product.price.mrp.toLocaleString()}</span>
                                                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                                        SAVE {Math.round(((product.price.mrp - product.price.amount) / product.price.mrp) * 100)}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => {
                                                setIsEditingBasePrice(true);
                                                setEditingBasePriceValue(product.price?.amount);
                                                setEditingBasePriceMrp(product.price?.mrp || "");
                                            }}
                                            className="text-primary hover:text-primary/80 transition-colors flex items-center"
                                            title="Edit Base Price"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="h-px bg-surface-container-high w-full mb-6" />

                        <h2 className="text-xs uppercase tracking-[0.24em] font-semibold text-secondary mb-3">
                            Description
                        </h2>

                        <p className="text-on-surface-variant leading-relaxed mb-8 text-sm">
                            {product.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-8">

                            <div className="rounded-xl border border-surface-container-high p-4 bg-surface-container">
                                <p className="text-xs text-outline mb-1 font-semibold uppercase tracking-wider">
                                    Product ID
                                </p>
                                <p className="text-sm break-all font-medium">
                                    {product._id}
                                </p>
                            </div>

                            <div className="rounded-xl border border-surface-container-high p-4 bg-surface-container">
                                <p className="text-xs text-outline mb-1 font-semibold uppercase tracking-wider">
                                    Images
                                </p>
                                <p className="text-sm font-medium">
                                    {product.images?.length || 0}
                                </p>
                            </div>

                        </div>

                        {/* Variants List */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xs uppercase tracking-[0.24em] font-semibold text-secondary">
                                    Variants ({product.variants?.length || 0})
                                </h2>
                                <button
                                    onClick={() => setIsVariantFormOpen(true)}
                                    className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/20 transition-colors"
                                >
                                    + Add New Variant
                                </button>
                            </div>

                            {product.variants?.length > 0 ? (
                                <div className="space-y-3">
                                    {product.variants.map((variant, idx) => (
                                        <div key={idx} className="p-3 rounded-xl border border-surface-container-high bg-surface-container/50 flex items-center gap-3">
                                            {variant.images?.[0]?.url ? (
                                                <img src={variant.images[0].url} alt="Variant" className="w-10 h-10 rounded-lg object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-outline" style={{fontSize:'16px'}}>image</span>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold text-on-surface truncate">
                                                    {Object.entries(variant.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(', ') || 'Default Variant'}
                                                </div>
                                                <div className="text-xs text-on-surface-variant flex items-center gap-2 mt-1">
                                                    <span>{variant.price?.currency || product.price?.currency}</span>
                                                    {editingPriceVariantId === variant._id ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex flex-col gap-1">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    placeholder="Price"
                                                                    className="w-20 h-6 bg-background border border-surface-container-high rounded px-1 outline-none text-xs"
                                                                    value={editingPriceVariantValue}
                                                                    onChange={(e) => setEditingPriceVariantValue(e.target.value)}
                                                                />
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    placeholder="MRP"
                                                                    className="w-20 h-6 bg-background border border-surface-container-high rounded px-1 outline-none text-xs"
                                                                    value={editingPriceVariantMrp}
                                                                    onChange={(e) => setEditingPriceVariantMrp(e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <button
                                                                    onClick={() => handleSaveVariantPrice(variant._id)}
                                                                    disabled={isUpdatingVariantPrice}
                                                                    className="px-2 py-0.5 bg-primary text-on-primary rounded text-[10px] font-bold hover:opacity-90 disabled:opacity-50"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingPriceVariantId(null)}
                                                                    disabled={isUpdatingVariantPrice}
                                                                    className="px-2 py-0.5 bg-surface-container-high text-on-surface rounded text-[10px] font-bold hover:bg-surface-container-highest"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-semibold">{variant.price?.amount || product.price?.amount}</span>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingPriceVariantId(variant._id);
                                                                        setEditingPriceVariantValue(variant.price?.amount || product.price?.amount);
                                                                        setEditingPriceVariantMrp(variant.price?.mrp || product.price?.mrp || "");
                                                                    }}
                                                                    className="text-primary hover:text-primary/80 transition-colors flex items-center ml-1"
                                                                    title="Edit Variant Price"
                                                                >
                                                                    <span className="material-symbols-outlined text-[14px]">edit</span>
                                                                </button>
                                                            </div>
                                                            {(variant.price?.mrp || product.price?.mrp) > (variant.price?.amount || product.price?.amount) && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="text-[10px] text-outline line-through">{variant.price?.mrp || product.price?.mrp}</span>
                                                                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1 rounded">
                                                                        -{Math.round((((variant.price?.mrp || product.price?.mrp) - (variant.price?.amount || product.price?.amount)) / (variant.price?.mrp || product.price?.mrp)) * 100)}%
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <span>•</span>
                                                    {editingStockId === variant._id ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                className="w-16 h-6 bg-background border border-surface-container-high rounded px-1 outline-none text-xs"
                                                                value={editingStockValue}
                                                                onChange={(e) => setEditingStockValue(e.target.value)}
                                                            />
                                                            <button
                                                                onClick={() => handleSaveStock(variant._id)}
                                                                disabled={isUpdatingStock}
                                                                className="px-2 py-0.5 bg-primary text-on-primary rounded text-[10px] font-bold hover:opacity-90 disabled:opacity-50"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingStockId(null)}
                                                                disabled={isUpdatingStock}
                                                                className="px-2 py-0.5 bg-surface-container-high text-on-surface rounded text-[10px] font-bold hover:bg-surface-container-highest"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span className={variant.stock > 0 ? "text-emerald-400" : "text-error"}>
                                                                {variant.stock > 0 ? `${variant.stock} in stock` : "Out of stock"}
                                                            </span>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingStockId(variant._id);
                                                                    setEditingStockValue(variant.stock);
                                                                }}
                                                                className="text-primary hover:text-primary/80 transition-colors flex items-center"
                                                                title="Edit Stock"
                                                            >
                                                                <span className="material-symbols-outlined text-[14px]">edit</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-on-surface-variant">No variants added yet.</p>
                            )}
                        </div>

                        <button
                            onClick={() => navigate(-1)}
                            className="w-full h-12 rounded-full bg-primary text-on-primary font-bold tracking-wider uppercase flex items-center justify-center hover:opacity-90 transition-opacity"
                        >
                            Back to Products
                        </button>

                    </div>

                </div>

            </div>

            {/* Variant Form Modal */}
            {isVariantFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-surface-container border border-surface-container-high rounded-2xl p-6 w-full max-w-2xl my-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-on-surface">Add New Variant</h2>
                            <button onClick={() => setIsVariantFormOpen(false)} className="text-outline hover:text-on-surface">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSaveVariant} className="space-y-6">
                            
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-secondary mb-2">Variant Images (Up to 7)</label>
                                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                    {newVariant.images.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl border border-surface-container-high bg-background overflow-hidden group">
                                            {img ? (
                                                <>
                                                    <img src={img.url} className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => handleRemoveVariantImage(idx)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-error">
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                </>
                                            ) : (
                                                <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-surface-container-high transition-colors">
                                                    <span className="material-symbols-outlined text-outline">add_photo_alternate</span>
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                                        if(e.target.files[0]) handleAddVariantImage(idx, e.target.files[0])
                                                    }} />
                                                </label>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-secondary mb-2">Price Amount</label>
                                    <input type="number" min="0" value={newVariant.price.amount} onChange={e => setNewVariant(p => ({...p, price: {...p.price, amount: e.target.value}}))} className="w-full h-10 bg-background border border-surface-container-high rounded-lg px-3 text-sm text-on-surface outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-secondary mb-2">MRP (Optional)</label>
                                    <input type="number" min="0" value={newVariant.price.mrp} onChange={e => setNewVariant(p => ({...p, price: {...p.price, mrp: e.target.value}}))} className="w-full h-10 bg-background border border-surface-container-high rounded-lg px-3 text-sm text-on-surface outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-secondary mb-2">Currency</label>
                                    <select value={newVariant.price.currency} onChange={e => setNewVariant(p => ({...p, price: {...p.price, currency: e.target.value}}))} className="w-full h-10 bg-background border border-surface-container-high rounded-lg px-3 text-sm text-on-surface outline-none focus:border-primary">
                                        <option value="INR">INR</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                        <option value="AED">AED</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-secondary mb-2">Stock</label>
                                    <input type="number" required min="0" value={newVariant.stock} onChange={e => setNewVariant(p => ({...p, stock: e.target.value}))} className="w-full h-10 bg-background border border-surface-container-high rounded-lg px-3 text-sm text-on-surface outline-none focus:border-primary" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-secondary mb-2">Attributes</label>
                                <div className="flex gap-2 mb-3">
                                    <input type="text" placeholder="e.g. Size" value={attrKey} onChange={e => setAttrKey(e.target.value)} className="flex-1 h-10 bg-background border border-surface-container-high rounded-lg px-3 text-sm text-on-surface outline-none focus:border-primary" />
                                    <input type="text" placeholder="e.g. XL" value={attrValue} onChange={e => setAttrValue(e.target.value)} className="flex-1 h-10 bg-background border border-surface-container-high rounded-lg px-3 text-sm text-on-surface outline-none focus:border-primary" />
                                    <button type="button" onClick={handleAddAttribute} className="h-10 px-4 bg-surface-container-high text-on-surface rounded-lg font-bold hover:bg-surface-container-highest transition-colors">Add</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(newVariant.attributes).map(([k, v]) => (
                                        <div key={k} className="px-3 py-1.5 bg-background border border-surface-container-high rounded-full text-xs text-on-surface flex items-center gap-2">
                                            <span className="font-bold">{k}:</span> {v}
                                            <button type="button" onClick={() => handleRemoveAttribute(k)} className="text-outline hover:text-error"><span className="material-symbols-outlined" style={{fontSize:'14px'}}>close</span></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" disabled={isSubmittingVariant} className="w-full h-12 rounded-full bg-primary text-on-primary font-bold tracking-wider uppercase flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all">
                                {isSubmittingVariant ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : "Save Variant"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SellerProductDetail