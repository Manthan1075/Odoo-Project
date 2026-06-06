import React, { useState } from 'react'
import { Image } from '@mantine/core'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import { loginUser } from '../api/userApi.js'

function Login() {

    const navigate = useNavigate()

    const [loading, setLoading] = useState(false)

    const {
        handleSubmit,
        register,
        formState: { errors }
    } = useForm()

    const onSubmit = async (data) => {

        try {

            setLoading(true)

            const res = await loginUser({
                email: data.email,
                password: data.password
            })

            toast.success(
                res?.message || "Login Successful"
            )

            // Save user if needed
            localStorage.setItem(
                "user",
                JSON.stringify(res.user)
            )

            // Save token if backend returns token
            if (res.token) {
                localStorage.setItem(
                    "token",
                    res.token
                )
            }

            navigate("/")

        } catch (error) {

            toast.error(
                error?.message ||
                "Invalid Credentials"
            )

        } finally {

            setLoading(false)

        }

    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

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

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                >

                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="Enter email..."
                            {...register("email", {
                                required: "Email is required"
                            })}
                            className={`
                                w-full
                                px-4
                                py-3
                                border
                                rounded-lg
                                outline-none
                                ${errors.email
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }
                            `}
                        />

                        {
                            errors.email && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.email.message}
                                </p>
                            )
                        }

                    </div>

                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Enter password..."
                            {...register("password", {
                                required: "Password is required"
                            })}
                            className={`
                                w-full
                                px-4
                                py-3
                                border
                                rounded-lg
                                outline-none
                                ${errors.password
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }
                            `}
                        />

                        {
                            errors.password && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.password.message}
                                </p>
                            )
                        }

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="
                            w-full
                            bg-blue-600
                            hover:bg-blue-700
                            text-white
                            py-3
                            rounded-lg
                            font-semibold
                            transition
                            disabled:opacity-70
                        "
                    >
                        {
                            loading
                                ? "Logging In..."
                                : "Login"
                        }
                    </button>

                </form>

            </div>

        </div>
    )
}

export default Login