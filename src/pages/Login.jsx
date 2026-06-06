import React from 'react'
import { Image } from '@mantine/core'
import { useForm } from 'react-hook-form'

function Login() {

    const {
        handleSubmit,
        register,
        formState: { errors }
    } = useForm()

    const onSubmit = (data) => {
        console.log(data)
        // API Call
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

                {/* Logo */}
                <div className="flex flex-col items-center mb-8">

                    <Image
                        src="/assets/logo.png"
                        alt="Vendor Bridge"
                        h={80}
                        w={80}
                        fit="contain"
                    />

                    <h1 className="text-3xl font-bold text-blue-600 mt-4">
                        Vendor Bridge
                    </h1>

                    <p className="text-gray-500 text-sm mt-2">
                        Login to your account
                    </p>

                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                >

                    {/* Email */}
                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="Enter email..."
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Enter a valid email address"
                                }
                            })}
                            className={`
                                w-full
                                px-4
                                py-3
                                border
                                rounded-lg
                                outline-none
                                transition
                                focus:ring-2
                                focus:ring-blue-500
                                focus:border-blue-500
                                ${errors.email
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }
                            `}
                        />

                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.email.message}
                            </p>
                        )}

                    </div>

                    {/* Password */}
                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Enter password..."
                            {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 6,
                                    message:
                                        "Password must be at least 6 characters"
                                }
                            })}
                            className={`
                                w-full
                                px-4
                                py-3
                                border
                                rounded-lg
                                outline-none
                                transition
                                focus:ring-2
                                focus:ring-blue-500
                                focus:border-blue-500
                                ${errors.password
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }
                            `}
                        />

                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.password.message}
                            </p>
                        )}

                    </div>

                    <button
                        type="submit"
                        className="
                            w-full
                            bg-blue-600
                            hover:bg-blue-700
                            text-white
                            py-3
                            rounded-lg
                            font-semibold
                            transition
                            duration-300
                            cursor-pointer
                        "
                    >
                        Login
                    </button>

                </form>

            </div>

        </div>
    )
}

export default Login