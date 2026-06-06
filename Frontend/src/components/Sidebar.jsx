import React from 'react'
import { Link } from 'react-router'
import {
    Users,
    ShoppingBag,
    FileText,
    ClipboardList,
    LayoutDashboard,
    FileCheck,
    Package
} from 'lucide-react'

function Sidebar() {

    const role = "officer" // Change dynamically

    const Links = {
        admin: {
            users: "/users",
            vendors: "/vendors",
            report: "/report",
            orders: "/orders"
        },

        vendor: {
            quotation: "/quotation/id",
            orders: "/orders/id",
            rfq: "/rfq/id"
        },

        officer: {
            dashboard: "/dashboard",
            vendors: "/vendors",
            rfq: "/rfq",
            quotation: "/quotations",
            approvals: "/approvals",
            orders: "/orders",
            report: "/report"
        },

        manager: {
            dashboard: "/dashboard",
            vendors: "/vendors",
            rfq: "/rfq",
            quotation: "/quotation",
            approvals: "/approvals",
            orders: "/orders",
            report: "/report"
        }
    }

    const icons = {
        dashboard: <LayoutDashboard size={18} />,
        users: <Users size={18} />,
        vendors: <ShoppingBag size={18} />,
        report: <FileText size={18} />,
        orders: <Package size={18} />,
        quotation: <ClipboardList size={18} />,
        rfq: <ClipboardList size={18} />,
        approvals: <FileCheck size={18} />
    }

    return (
        <aside
            className="
                w-64
                h-screen
                bg-white
                border-r
                border-gray-200
                shadow-sm
                px-4
                py-6
            "
        >
            {/* Heading */}


            {/* Links */}
            <div className="flex flex-col gap-2">

                {Object.entries(Links[role]).map(([name, path]) => (

                    <Link
                        key={name}
                        to={path}
                        className="
                            flex
                            items-center
                            gap-3
                            px-4
                            py-3
                            rounded-xl
                            text-gray-700
                            hover:bg-blue-50
                            hover:text-blue-600
                            transition
                            duration-300
                        "
                    >
                        {icons[name]}

                        <span className="capitalize">
                            {name}
                        </span>

                    </Link>

                ))}

            </div>
        </aside>
    )
}

export default Sidebar