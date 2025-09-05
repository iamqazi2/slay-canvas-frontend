"use client"
import { useRef, useState } from "react"
import { Play, Pause } from "lucide-react"
import { videos } from "@/app/assets"
import { motion } from "framer-motion";
import { fadeIn } from "@/app/variants";

const Sec7Card = () => {
    // Har video ke liye ek ref
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
    const [playingIndex, setPlayingIndex] = useState<number | null>(null)

    const handlePlayPause = (index: number) => {
        const currentVideo = videoRefs.current[index]
        if (!currentVideo) return

        if (playingIndex === index) {
            currentVideo.pause()
            setPlayingIndex(null)
        } else {
            if (playingIndex !== null && videoRefs.current[playingIndex]) {
                videoRefs.current[playingIndex]?.pause()
            }
            currentVideo.play()
            setPlayingIndex(index)
        }
    }

    return (
        <motion.div
            variants={fadeIn({ direction: "up", delay: 0.1 })}
            initial="hidden"
            whileInView="show"

            className="flex items-center gap-6 justify-center mt-6 flex-wrap md:flex-wrap px-4 sm:px-0">
            {videos.map((item, idx) => (
                <div
                    key={idx}
                    className="relative sm:w-[280px] h-[300px] rounded-xl border border-purple-300 overflow-hidden shadow-md"
                >
                    {/* Video */}
                    <video
                        ref={(el) => {
                            videoRefs.current[idx] = el as HTMLVideoElement | null
                        }}
                        className="w-full h-full object-cover"
                        loop
                        muted
                        playsInline
                    >
                        <source src={item.src} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    {/* Info Section */}
                    <div className="absolute bottom-3 left-3 text-white drop-shadow-md">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-sm opacity-90">{item.title}</p>
                    </div>

                    {/* Play/Pause Button */}
                    <button
                        onClick={() => handlePlayPause(idx)}
                        className="absolute bottom-3 right-3 bg-white rounded-full p-2 shadow-md hover:scale-105 transition"
                    >
                        {playingIndex === idx ? (
                            <Pause className="text-purple-600 w-5 h-5" />
                        ) : (
                            <Play className="text-purple-600 w-5 h-5" />
                        )}
                    </button>
                </div>
            ))}
        </motion.div>
    )
}

export default Sec7Card
