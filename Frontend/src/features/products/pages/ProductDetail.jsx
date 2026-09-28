import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useProduct } from '../hook/useProduct.js'
import gsap from 'gsap'

const ProductDetail = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [activeImage, setActiveImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const blob1Ref = useRef(null);
    const blob2Ref = useRef(null);
    const cardRef = useRef(null);

    const { handleGetProductById } = useProduct();

    async function fetchProductDetails(){
        setIsLoading(true);
        try {
            const data = await handleGetProductById(productId);
            setProduct(data);
            if (data?.images?.length > 0) {
                setActiveImage(data.images[0].url);
            }
        } catch (error) {
            console.error("Failed to fetch product", error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleNextImage = () => {
        if (!product?.images) return;
        const currentIndex = product.images.findIndex(img => img.url === activeImage);
        const nextIndex = (currentIndex + 1) % product.images.length;
        setActiveImage(product.images[nextIndex].url);
    };

    const handlePrevImage = () => {
        if (!product?.images) return;
        const currentIndex = product.images.findIndex(img => img.url === activeImage);
        const prevIndex = (currentIndex - 1 + product.images.length) % product.images.length;
        setActiveImage(product.images[prevIndex].url);
    };

    useEffect(() => {
        fetchProductDetails()
    }, [productId]);

    // GSAP Animations
    useEffect(() => {
        if (!isLoading && product) {
            // Animate card fading up
            gsap.fromTo(cardRef.current, 
                { y: 60, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }
            );

            // Animate background blobs
            gsap.to(blob1Ref.current, {
                x: "random(-100, 100)",
                y: "random(-100, 100)",
                duration: "random(4, 6)",
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            gsap.to(blob2Ref.current, {
                x: "random(-150, 150)",
                y: "random(-150, 150)",
                duration: "random(5, 8)",
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }
    }, [isLoading, product]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <p className="text-xl font-medium text-gray-400">Product not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden flex items-center">
            
            {/* GSAP Background Blobs */}
            <div 
                ref={blob1Ref} 
                className="absolute top-0 left-0 md:top-1/4 md:left-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-purple-600/30 rounded-full blur-[100px] md:blur-[120px] pointer-events-none z-0"
            />
            <div 
                ref={blob2Ref} 
                className="absolute bottom-0 right-0 md:bottom-1/4 md:right-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-blue-600/30 rounded-full blur-[100px] md:blur-[120px] pointer-events-none z-0"
            />

            {/* Main Content */}
            <div ref={cardRef} className="relative z-10 w-full max-w-6xl mx-auto bg-[#111]/80 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10">
                <div className="flex flex-col md:flex-row">
                    {/* Image Section */}
                    <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col gap-6 bg-white/5">
                        <div className="w-full aspect-[4/5] bg-black/40 rounded-2xl overflow-hidden shadow-inner relative group">
                            {activeImage ? (
                                <>
                                    <img 
                                        src={activeImage} 
                                        alt={product.title} 
                                        className="w-full h-full object-cover object-center transition-transform duration-700 ease-in-out group-hover:scale-105"
                                    />
                                    {product.images && product.images.length > 1 && (
                                        <>
                                            <button 
                                                onClick={handlePrevImage}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={handleNextImage}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    No Image Available
                                </div>
                            )}
                        </div>
                        
                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {product.images.map((img) => (
                                    <button
                                        key={img._id}
                                        onClick={() => setActiveImage(img.url)}
                                        className={`flex-shrink-0 w-20 h-24 md:w-24 md:h-32 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                                            activeImage === img.url 
                                                ? 'border-white ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a] scale-105' 
                                                : 'border-transparent hover:border-gray-500 opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        <img 
                                            src={img.url} 
                                            alt="thumbnail" 
                                            className="w-full h-full object-cover object-center"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col">
                        <div className="flex flex-col gap-2 mb-8">
                            <span className="text-sm font-bold tracking-widest text-purple-400 uppercase">
                                New Arrival
                            </span>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                                {product.title}
                            </h1>
                        </div>
                        
                        <div className="flex items-center mb-8">
                            <span className="text-4xl md:text-5xl font-bold text-white">
                                {product.price?.currency === 'INR' ? '₹' : product.price?.currency} 
                                {product.price?.amount?.toLocaleString('en-IN')}
                            </span>
                            <span className="ml-4 text-lg text-gray-500 line-through">
                                {product.price?.currency === 'INR' ? '₹' : product.price?.currency} 
                                {Math.round(product.price?.amount * 1.3).toLocaleString('en-IN')}
                            </span>
                        </div>
                        
                        <div className="w-full h-px bg-white/10 mb-8"></div>

                        <div className="mb-12 flex-grow">
                            <h3 className="text-xl font-bold text-gray-200 mb-4">Description</h3>
                            <p className="text-base text-gray-400 leading-relaxed whitespace-pre-line">
                                {product.description}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-6 border-t border-white/10">
                            <button className="flex-1 bg-white/5 border-2 border-white/20 text-white font-bold py-4 px-8 rounded-2xl hover:bg-white/10 hover:border-white/40 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(255,255,255,0.05)] transition-all duration-300 flex items-center justify-center gap-3 text-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                </svg>
                                Add to Cart
                            </button>
                            <button className="flex-1 bg-white text-black font-bold py-4 px-8 rounded-2xl hover:bg-gray-200 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(255,255,255,0.1)] transition-all duration-300 flex items-center justify-center gap-3 text-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                                </svg>
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetail
