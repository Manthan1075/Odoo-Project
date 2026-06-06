import React from 'react'
import { Avatar, Image } from '@mantine/core'
import { User } from 'lucide-react'
import { Link } from 'react-router'

function Navbar() {
    return (
        <nav className="w-full bg-white border-b border-gray-200 shadow-sm px-6 py-3 flex justify-between items-center">
            {/* Logo Section */}
            <div className="flex items-center gap-2">

                <Image
                    src="/assets/logo.png"
                    alt="Vendor Bridge"
                    h={45}
                    w={45}
                    fit="contain"
                />

                <div>
                    <h2 className="text-xl font-bold text-gray-800">
                        Vendor Bridge
                    </h2>

                </div>
            </div>

            {/* Profile */}
            <Link to="/profile">
                <Avatar
                    radius="xl"
                    size="md"
                    className="cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg"
                >
                    <User size={18} />
                </Avatar>
            </Link>
        </nav>
    )
}

export default Navbar