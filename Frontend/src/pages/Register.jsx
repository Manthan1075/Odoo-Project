import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Select } from '@mantine/core'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import { registerUser } from '../api/userApi'

function Register() {

    const navigate = useNavigate()

    const [loading, setLoading] = useState(false)

    const {
        handleSubmit,
        register,
        control,
        formState: { errors }
    } = useForm()

    const onSubmit = async (data) => {

        try {

            if (data.password !== data.confirmPassword) {

                toast.error("Passwords do not match")

                return
            }

            setLoading(true)

            const res = await registerUser({
                username: data.username,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password,
                phone: data.phone,
                role: data.role
            })

            toast.success(
                res?.message ||
                "User Registered Successfully"
            )

            navigate("/dashboard")

        } catch (error) {

            toast.error(
                error?.message ||
                "Registration Failed"
            )

        } finally {

            setLoading(false)

        }

    }

    const inputStyle = `
        w-full
        px-4
        py-3
        border
        rounded-xl
        outline-none
        transition
        focus:ring-4
        focus:ring-blue-100
        focus:border-blue-600
    `

    return (

        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">

            <div className="w-full max-w-5xl bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

                {/* Header */}

                <div className="mb-8">

                    <h1 className="text-3xl font-bold text-slate-800">
                        Register User
                    </h1>

                    <p className="text-slate-500 mt-2">
                        Register a new user in Vendor Bridge
                    </p>

                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                >

                    {/* Username + Email */}

                    <div className="grid md:grid-cols-2 gap-5">

                        <div>

                            <label className="block mb-2">
                                Username
                            </label>

                            <input
                                type="text"
                                placeholder="Enter username"
                                {...register("username", {
                                    required: "Username is required",
                                    minLength: {
                                        value: 3,
                                        message: "Minimum 3 characters"
                                    }
                                })}
                                className={`${inputStyle}
                                ${errors.username
                                        ? "border-red-500"
                                        : "border-slate-300"
                                    }`}
                            />

                            {
                                errors.username && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.username.message}
                                    </p>
                                )
                            }

                        </div>

                        <div>

                            <label className="block mb-2">
                                Email
                            </label>

                            <input
                                type="email"
                                placeholder="Enter email"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value:
                                            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message:
                                            "Enter valid email"
                                    }
                                })}
                                className={`${inputStyle}
                                ${errors.email
                                        ? "border-red-500"
                                        : "border-slate-300"
                                    }`}
                            />

                            {
                                errors.email && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.email.message}
                                    </p>
                                )
                            }

                        </div>

                    </div>

                    {/* First Name + Last Name */}

                    <div className="grid md:grid-cols-2 gap-5">

                        <div>

                            <label className="block mb-2">
                                First Name
                            </label>

                            <input
                                type="text"
                                placeholder="Enter first name"
                                {...register("firstName", {
                                    required:
                                        "First name is required"
                                })}
                                className={`${inputStyle}
                                ${errors.firstName
                                        ? "border-red-500"
                                        : "border-slate-300"
                                    }`}
                            />

                            {
                                errors.firstName && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.firstName.message}
                                    </p>
                                )
                            }

                        </div>

                        <div>

                            <label className="block mb-2">
                                Last Name
                            </label>

                            <input
                                type="text"
                                placeholder="Enter last name"
                                {...register("lastName", {
                                    required:
                                        "Last name is required"
                                })}
                                className={`${inputStyle}
                                ${errors.lastName
                                        ? "border-red-500"
                                        : "border-slate-300"
                                    }`}
                            />

                            {
                                errors.lastName && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.lastName.message}
                                    </p>
                                )
                            }

                        </div>

                    </div>

                    {/* Password + Confirm Password */}

                    <div className="grid md:grid-cols-2 gap-5">

                        <div>

                            <label className="block mb-2">
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter password"
                                {...register("password", {
                                    required:
                                        "Password is required",
                                    minLength: {
                                        value: 6,
                                        message:
                                            "Password must be at least 6 characters"
                                    }
                                })}
                                className={`${inputStyle}
                                ${errors.password
                                        ? "border-red-500"
                                        : "border-slate-300"
                                    }`}
                            />

                            {
                                errors.password && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.password.message}
                                    </p>
                                )
                            }

                        </div>

                        <div>

                            <label className="block mb-2">
                                Confirm Password
                            </label>

                            <input
                                type="password"
                                placeholder="Confirm password"
                                {...register(
                                    "confirmPassword",
                                    {
                                        required:
                                            "Confirm password is required"
                                    }
                                )}
                                className={`${inputStyle}
                                ${errors.confirmPassword
                                        ? "border-red-500"
                                        : "border-slate-300"
                                    }`}
                            />

                            {
                                errors.confirmPassword && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {
                                            errors.confirmPassword
                                                .message
                                        }
                                    </p>
                                )
                            }

                        </div>

                    </div>

                    {/* Phone + Role */}

                    <div className="grid md:grid-cols-2 gap-5">

                        <div>

                            <label className="block mb-2">
                                Phone Number
                            </label>

                            <input
                                type="tel"
                                placeholder="Enter phone number"
                                {...register("phone", {
                                    required:
                                        "Phone number is required",
                                    pattern: {
                                        value:
                                            /^[0-9]{10}$/,
                                        message:
                                            "Enter valid 10 digit number"
                                    }
                                })}
                                className={`${inputStyle}
                                ${errors.phone
                                        ? "border-red-500"
                                        : "border-slate-300"
                                    }`}
                            />

                            {
                                errors.phone && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.phone.message}
                                    </p>
                                )
                            }

                        </div>

                        <div>

                            <Controller
                                name="role"
                                control={control}
                                rules={{
                                    required:
                                        "Please select a role"
                                }}
                                render={({ field }) => (
                                    <Select
                                        label="Role"
                                        placeholder="Select Role"
                                        data={[
                                            {
                                                value: "admin",
                                                label: "Admin"
                                            },
                                            {
                                                value: "vendor",
                                                label: "Vendor"
                                            },
                                            {
                                                value: "officer",
                                                label: "Procurement Officer"
                                            },
                                            {
                                                value: "manager",
                                                label: "Manager"
                                            }
                                        ]}
                                        {...field}
                                        error={
                                            errors.role?.message
                                        }
                                    />
                                )}
                            />

                        </div>

                    </div>

                    {/* Buttons */}

                    <div className="flex justify-end gap-3 pt-5">

                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="
                                px-6
                                py-3
                                border
                                border-slate-300
                                rounded-xl
                                hover:bg-slate-100
                            "
                        >
                            Back
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="
                                px-8
                                py-3
                                bg-blue-600
                                text-white
                                rounded-xl
                                hover:bg-blue-700
                                disabled:opacity-70
                            "
                        >
                            {
                                loading
                                    ? "Registering..."
                                    : "Register User"
                            }
                        </button>

                    </div>

                </form>

            </div>

        </div>

    )
}

export default Register