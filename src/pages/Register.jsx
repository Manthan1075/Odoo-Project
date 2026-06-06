import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Select } from '@mantine/core'
import { Link } from 'react-router'

function Register() {

    const {
        handleSubmit,
        register,
        control,
        formState: { errors }
    } = useForm()

    const onSubmit = (data) => {
        console.log(data)
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

            <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

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
                                        message:
                                            "Minimum 3 characters"
                                    }
                                })}
                                className={`${inputStyle}
                                ${errors.username
                                        ? "border-red-500"
                                        : "border-slate-300"
                                    }`}
                            />

                            {errors.username && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.username.message}
                                </p>
                            )}

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

                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.email.message}
                                </p>
                            )}

                        </div>

                    </div>

                    {/* First + Last */}

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

                            {errors.firstName && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.firstName.message}
                                </p>
                            )}

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

                            {errors.lastName && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.lastName.message}
                                </p>
                            )}

                        </div>

                    </div>

                    {/* Phone + Role */}

                    <div className="grid md:grid-cols-2 gap-5">

                        <div>

                            <label className="block mb-2">
                                Phone
                            </label>

                            <input
                                type="tel"
                                placeholder="Enter phone"
                                {...register("phone", {
                                    required:
                                        "Phone number required",
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

                            {errors.phone && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.phone.message}
                                </p>
                            )}

                        </div>

                        <div>

                            <Controller
                                name="role"
                                control={control}
                                rules={{
                                    required:
                                        "Select a role"
                                }}
                                render={({ field }) => (
                                    <Select
                                        label="Role"
                                        placeholder="Select Role"
                                        data={[
                                            "Admin",
                                            "Vendor",
                                            "Procurement Officer",
                                            "Manager"
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

                        <Link
                            to={-1}
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
                        </Link>

                        <button
                            type="submit"
                            className="
                                px-8
                                py-3
                                bg-blue-600
                                text-white
                                rounded-xl
                                hover:bg-blue-700
                            "
                        >
                            Register User
                        </button>

                    </div>

                </form>

            </div>

        </div>
    )
}

export default Register