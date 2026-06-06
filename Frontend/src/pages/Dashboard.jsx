import React, { useEffect, useState } from 'react'
import {
    Button,
    Card,
    Loader,
    Table
} from '@mantine/core'

import {
    BarChart
} from '@mantine/charts'

import {
    Plus
} from 'lucide-react'

import { toast } from 'react-toastify'

import {
    getDashboardStats,
    getRecentPOs,
    getSpendingTrend,
    getQuickStats
} from '../api/dashboardApi'

function Dashboard() {

    const role = "Procurement Officer"

    const [loading, setLoading] = useState(true)

    const [stats, setStats] = useState({
        activeRFQs: 0,
        pendingApprovals: 0,
        poThisMonth: 0,
        overdueInvoices: 0
    })

    const [orders, setOrders] = useState([])

    const [spending, setSpending] = useState([])

    const [quickStats, setQuickStats] = useState({
        totalVendors: 0,
        approvedVendors: 0,
        blockedVendors: 0,
        totalPOs: 0
    })

    useEffect(() => {

        const fetchDashboardData = async () => {

            try {

                setLoading(true)

                const [
                    statsResult,
                    ordersResult,
                    spendingResult,
                    quickStatsResult
                ] = await Promise.allSettled([
                    getDashboardStats(),
                    getRecentPOs(),
                    getSpendingTrend(),
                    getQuickStats()
                ])

                // Dashboard Stats

                if (
                    statsResult.status === "fulfilled"
                ) {

                    setStats(
                        statsResult.value?.data || {
                            activeRFQs: 0,
                            pendingApprovals: 0,
                            poThisMonth: 0,
                            overdueInvoices: 0
                        }
                    )

                }

                // Recent Orders

                if (
                    ordersResult.status === "fulfilled"
                ) {

                    setOrders(
                        ordersResult.value?.data || []
                    )

                }

                // Spending Trend

                if (
                    spendingResult.status === "fulfilled"
                ) {

                    const formattedTrend =
                        spendingResult.value?.data?.map(
                            (item) => ({
                                month:
                                    `${item?._id?.month}/${item?._id?.year}`,
                                spends:
                                    item?.spends || 0
                            })
                        ) || []

                    setSpending(
                        formattedTrend
                    )

                }

                // Quick Stats

                if (
                    quickStatsResult.status === "fulfilled"
                ) {

                    setQuickStats(
                        quickStatsResult.value?.data || {
                            totalVendors: 0,
                            approvedVendors: 0,
                            blockedVendors: 0,
                            totalPOs: 0
                        }
                    )

                }

            } catch (error) {

                toast.error(
                    error?.message ||
                    "Failed to load dashboard"
                )

            } finally {

                setLoading(false)

            }

        }

        fetchDashboardData()

    }, [])

    const cards = [
        {
            title: "Active RFQ's",
            value: stats?.activeRFQs ?? 0
        },
        {
            title: "Pending Approvals",
            value: stats?.pendingApprovals ?? 0
        },
        {
            title: "PO's This Month",
            value: `₹${(
                stats?.poThisMonth || 0
            ).toLocaleString()}`
        },
        {
            title: "Overdue Invoices",
            value: stats?.overdueInvoices ?? 0
        }
    ]

    const totalSpend =
        spending?.reduce(
            (acc, item) =>
                acc + (item?.spends || 0),
            0
        ) || 0

    const growth =
        spending?.length >= 2
            ? (
                (
                    (
                        spending[
                            spending.length - 1
                        ]?.spends || 0
                    ) -
                    (
                        spending[0]?.spends || 0
                    )
                ) /
                (
                    spending[0]?.spends || 1
                )
            ) * 100
            : 0

    if (loading) {

        return (
            <div className="
                min-h-screen
                flex
                justify-center
                items-center
            ">
                <Loader size="lg" />
            </div>
        )

    }

    return (

        <div className="min-h-screen bg-slate-50 p-8">

            {/* Header */}

            <div className="mb-8">

                <h1 className="text-3xl font-bold text-slate-800">
                    Dashboard
                </h1>

                <p className="text-slate-500 mt-1">
                    Welcome back, {role}
                </p>

            </div>

            {/* Cards */}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

                {
                    cards.map((item) => (

                        <Card
                            key={item.title}
                            radius="lg"
                            shadow="sm"
                            className="
                                border
                                border-slate-200
                                py-8
                            "
                        >

                            <div className="text-center">

                                <h2 className="text-4xl font-bold text-blue-600">
                                    {item.value}
                                </h2>

                                <p className="mt-3 text-slate-500">
                                    {item.title}
                                </p>

                            </div>

                        </Card>

                    ))
                }

            </div>

            {/* Orders & Chart */}

            <div className="grid lg:grid-cols-3 gap-6">

                {/* Orders */}

                <Card
                    radius="lg"
                    className="
                        lg:col-span-2
                        border
                        border-slate-200
                    "
                >

                    <h3 className="text-lg font-semibold mb-5">
                        Recent Purchase Orders
                    </h3>

                    <Table
                        striped
                        highlightOnHover
                    >

                        <Table.Thead>

                            <Table.Tr>

                                <Table.Th>
                                    PO#
                                </Table.Th>

                                <Table.Th>
                                    Vendor
                                </Table.Th>

                                <Table.Th>
                                    Amount
                                </Table.Th>

                                <Table.Th>
                                    Status
                                </Table.Th>

                            </Table.Tr>

                        </Table.Thead>

                        <Table.Tbody>

                            {
                                orders?.length > 0 ? (

                                    orders.map(
                                        (item) => (

                                            <Table.Tr
                                                key={
                                                    item?._id
                                                }
                                            >

                                                <Table.Td>
                                                    {
                                                        item?.poNumber ||
                                                        "N/A"
                                                    }
                                                </Table.Td>

                                                <Table.Td>
                                                    {
                                                        item?.vendorId?.companyName ||
                                                        "N/A"
                                                    }
                                                </Table.Td>

                                                <Table.Td>
                                                    ₹
                                                    {
                                                        item?.grandTotal?.toLocaleString() ||
                                                        0
                                                    }
                                                </Table.Td>

                                                <Table.Td>

                                                    <span
                                                        className={`
                                                        px-3
                                                        py-1
                                                        rounded-full
                                                        text-sm

                                                        ${item?.status === "Approved"
                                                                ? "bg-green-100 text-green-700"
                                                                : item?.status === "Pending"
                                                                    ? "bg-yellow-100 text-yellow-700"
                                                                    : "bg-gray-100 text-gray-700"
                                                            }
                                                    `}
                                                    >
                                                        {
                                                            item?.status ||
                                                            "Unknown"
                                                        }
                                                    </span>

                                                </Table.Td>

                                            </Table.Tr>

                                        )
                                    )

                                ) : (

                                    <Table.Tr>

                                        <Table.Td
                                            colSpan={4}
                                            className="text-center py-6"
                                        >
                                            No Purchase Orders Found
                                        </Table.Td>

                                    </Table.Tr>

                                )
                            }

                        </Table.Tbody>

                    </Table>

                </Card>

                {/* Spending Chart */}

                <Card
                    radius="lg"
                    className="
                        border
                        border-slate-200
                    "
                >

                    <h3 className="font-semibold mb-4">
                        Spending Trends
                    </h3>

                    <BarChart
                        h={260}
                        data={spending || []}
                        dataKey="month"
                        withLegend={false}
                        withTooltip
                        series={[
                            {
                                name: "spends",
                                color: "blue"
                            }
                        ]}
                    />

                    <div className="mt-5">

                        <div className="flex justify-between">

                            <span>
                                Total Spend
                            </span>

                            <span className="font-semibold">
                                ₹
                                {totalSpend.toLocaleString()}
                            </span>

                        </div>

                        <div className="flex justify-between mt-2">

                            <span>
                                Growth
                            </span>

                            <span className="font-semibold text-green-600">
                                {growth.toFixed(1)}%
                            </span>

                        </div>

                    </div>

                </Card>

            </div>

            {/* Vendor Summary */}

            <div className="mt-8">

                <Card
                    radius="lg"
                    className="
                        border
                        border-slate-200
                    "
                >

                    <h3 className="font-semibold mb-5">
                        Vendor Summary
                    </h3>

                    <div className="grid md:grid-cols-4 gap-5">

                        <div>

                            <p className="text-slate-500">
                                Total Vendors
                            </p>

                            <h4 className="text-xl font-bold">
                                {
                                    quickStats?.totalVendors ?? 0
                                }
                            </h4>

                        </div>

                        <div>

                            <p className="text-slate-500">
                                Approved Vendors
                            </p>

                            <h4 className="text-xl font-bold text-green-600">
                                {
                                    quickStats?.approvedVendors ?? 0
                                }
                            </h4>

                        </div>

                        <div>

                            <p className="text-slate-500">
                                Blocked Vendors
                            </p>

                            <h4 className="text-xl font-bold text-red-600">
                                {
                                    quickStats?.blockedVendors ?? 0
                                }
                            </h4>

                        </div>

                        <div>

                            <p className="text-slate-500">
                                Total PO's
                            </p>

                            <h4 className="text-xl font-bold">
                                {
                                    quickStats?.totalPOs ?? 0
                                }
                            </h4>

                        </div>

                    </div>

                </Card>

            </div>

            {/* Actions */}

            <div className="mt-8">

                <Card
                    radius="lg"
                    className="
                        border
                        border-slate-200
                    "
                >

                    <div className="flex flex-wrap gap-4">

                        <Button
                            leftSection={
                                <Plus size={16} />
                            }
                        >
                            New RFQ
                        </Button>

                        <Button
                            variant="default"
                            leftSection={
                                <Plus size={16} />
                            }
                        >
                            Add Vendor
                        </Button>

                        <Button
                            variant="light"
                        >
                            View Invoices
                        </Button>

                    </div>

                </Card>

            </div>

        </div>

    )
}

export default Dashboard