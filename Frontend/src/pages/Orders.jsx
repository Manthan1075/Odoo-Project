import React, { useState } from 'react'
import { Button, Badge, Table, Card } from '@mantine/core'
import { Link } from 'react-router'

function Orders() {

    const [orderData] = useState([
        {
            id: 1,
            companyName: "Infra Supplies Pvt Ltd",
            totalAmount: 185400,
            status: "Pending"
        },
        {
            id: 2,
            companyName: "Tech Core LTD",
            totalAmount: 325000,
            status: "Approved"
        },
        {
            id: 3,
            companyName: "FastLog Transport",
            totalAmount: 97500,
            status: "Completed"
        }
    ])

    return (
        <div className="p-8 bg-slate-50 min-h-screen">

            <div className="mb-6">

                <h1 className="text-3xl font-bold text-slate-800">
                    Purchase Orders
                </h1>

                <p className="text-slate-500 mt-1">
                    Manage all generated purchase orders
                </p>

            </div>

            <Card
                shadow="sm"
                radius="lg"
                withBorder
            >

                <Table
                    striped
                    highlightOnHover
                    verticalSpacing="md"
                >

                    <Table.Thead>

                        <Table.Tr>

                            <Table.Th>
                                Vendor Company
                            </Table.Th>

                            <Table.Th>
                                Total Amount
                            </Table.Th>

                            <Table.Th>
                                Status
                            </Table.Th>

                            <Table.Th>
                                Action
                            </Table.Th>

                        </Table.Tr>

                    </Table.Thead>

                    <Table.Tbody>

                        {
                            orderData.map((order) => (

                                <Table.Tr
                                    key={order.id}
                                >

                                    <Table.Td>
                                        {order.companyName}
                                    </Table.Td>

                                    <Table.Td>
                                        ₹{order.totalAmount.toLocaleString()}
                                    </Table.Td>

                                    <Table.Td>

                                        <Badge
                                            color={
                                                order.status === "Completed"
                                                    ? "green"
                                                    : order.status === "Approved"
                                                        ? "blue"
                                                        : "yellow"
                                            }
                                        >
                                            {order.status}
                                        </Badge>

                                    </Table.Td>

                                    <Table.Td>

                                        <Link
                                            to={`/order-invoice/${order.id}`}
                                        >
                                            <Button
                                                size="xs"
                                                variant="light"
                                                className='mr-2'
                                            >
                                                View Order
                                            </Button>
                                        </Link>

                                        <Link
                                            to={`/order-activity/${order.id}`}
                                        >
                                            <Button
                                                size="xs"
                                                variant="light"
                                            >
                                                View Logs
                                            </Button>
                                        </Link>

                                    </Table.Td>

                                </Table.Tr>

                            ))
                        }

                    </Table.Tbody>

                </Table>

            </Card>

        </div>
    )
}

export default Orders