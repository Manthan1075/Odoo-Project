import React from 'react'
import {
    Button,
    Card,
    Table
} from '@mantine/core'

import {
    BarChart
} from '@mantine/charts'

import {
    Plus
} from 'lucide-react'

function Dashboard() {

    const role = "Procurement Officer"

    const cards = [
        {
            title: "Active RFQ's",
            value: 12
        },
        {
            title: "Pending Approvals",
            value: 5
        },
        {
            title: "PO's this month",
            value: "$ 2.3L"
        },
        {
            title: "Overdue Invoices",
            value: 3
        }
    ]

    const orders = [
        {
            po: "PO1",
            vendor: "Infra",
            amount: "₹87000",
            status: "Approved"
        },
        {
            po: "PO2",
            vendor: "Tech Core",
            amount: "₹140000",
            status: "Pending"
        },
        {
            po: "PO3",
            vendor: "OfficeNeed Co",
            amount: "₹34900",
            status: "Draft"
        }
    ]

    const spending = [
        { month: "Jan", spends: 120000 },
        { month: "Feb", spends: 140000 },
        { month: "Mar", spends: 135000 },
        { month: "Apr", spends: 190000 },
        { month: "May", spends: 210000 },
        { month: "Jun", spends: 230000 }
    ]

    return (
        <div className="min-h-screen bg-slate-50 p-8">

            {/* Header */}

            <div className="mb-8">

                <h1 className="text-3xl font-bold text-slate-800">
                    Dashboard
                </h1>

                <p className="text-slate-500 mt-1">
                    Welcome back, {role} — Today's Overview
                </p>

            </div>

            {/* Cards */}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

                {cards.map((item) => (

                    <Card
                        key={item.title}
                        radius="lg"
                        shadow="sm"
                        className="
                        bg-white
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

                ))}

            </div>

            {/* Table + Chart */}

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

                                <Table.Th>PO#</Table.Th>

                                <Table.Th>Vendor</Table.Th>

                                <Table.Th>Amount</Table.Th>

                                <Table.Th>Status</Table.Th>

                            </Table.Tr>

                        </Table.Thead>

                        <Table.Tbody>

                            {
                                orders.map((item) => (

                                    <Table.Tr
                                        key={item.po}
                                    >

                                        <Table.Td>
                                            {item.po}
                                        </Table.Td>

                                        <Table.Td>
                                            {item.vendor}
                                        </Table.Td>

                                        <Table.Td>
                                            {item.amount}
                                        </Table.Td>

                                        <Table.Td>

                                            <span
                                                className={`
                                                px-3
                                                py-1
                                                rounded-full
                                                text-sm
                                                
                                                ${item.status ===
                                                        "Approved"
                                                        ? "bg-green-100 text-green-700"
                                                        : item.status ===
                                                            "Pending"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-gray-100 text-gray-700"
                                                    }
                                            `}
                                            >
                                                {
                                                    item.status
                                                }
                                            </span>

                                        </Table.Td>

                                    </Table.Tr>

                                ))
                            }

                        </Table.Tbody>

                    </Table>

                </Card>

                {/* Chart */}

                <Card
                    radius="lg"
                    className="
                    border
                    border-slate-200
                "
                >

                    <h3 className="font-semibold mb-4">

                        Spending Trends
                        <span className="text-slate-500 ml-2">
                            Last 6 Months
                        </span>

                    </h3>

                    <BarChart
                        h={260}
                        data={spending}
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

                    <div className="mt-6">

                        <div className="flex justify-between">

                            <span>
                                Total Spend
                            </span>

                            <span className="font-semibold">
                                ₹10.2L
                            </span>

                        </div>

                        <div className="flex justify-between mt-2">

                            <span>
                                Growth
                            </span>

                            <span className="text-green-600 font-semibold">
                                +18%
                            </span>

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
                            radius="md"
                            leftSection={<Plus size={16} />}
                        >
                            New RFQ
                        </Button>

                        <Button
                            radius="md"
                            variant="default"
                            leftSection={<Plus size={16} />}
                        >
                            Add Vendor
                        </Button>

                        <Button
                            radius="md"
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