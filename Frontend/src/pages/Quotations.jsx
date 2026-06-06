import React, { useState } from 'react'
import { Button, Card, Table } from '@mantine/core'

function Quotations() {

    const [quotationList] = useState([
        {
            id: 1,
            vendor: "Infra Supplies",
            total: 185000,
            gst: 18,
            deliveryDays: 10,
            rating: 4.5,
            paymentTerms: "30 Days",
            isLowest: true
        },
        {
            id: 2,
            vendor: "Tech Core LTD",
            total: 200010,
            gst: 18,
            deliveryDays: 14,
            rating: 4.2,
            paymentTerms: "30 Days",
            isLowest: false
        },
        {
            id: 3,
            vendor: "Office Need Co.",
            total: 214800,
            gst: 18,
            deliveryDays: 7,
            rating: 3.8,
            paymentTerms: "15 Days",
            isLowest: false
        }
    ])

    const criteria = [
        {
            label: "Grand Total",
            key: "total"
        },
        {
            label: "GST %",
            key: "gst"
        },
        {
            label: "Delivery (Days)",
            key: "deliveryDays"
        },
        {
            label: "Vendor Rating",
            key: "rating"
        },
        {
            label: "Payment Terms",
            key: "paymentTerms"
        }
    ]

    return (
        <div className="p-8 bg-slate-50 min-h-screen">

            {/* Header */}

            <div className="mb-10">

                <h1 className="text-3xl font-bold text-slate-800">
                    Quotation Comparison
                </h1>

                <p className="text-slate-500 mt-2">
                    RFQ: Office Furniture Procurement Q2 - 3 Quotations Received
                </p>

            </div>

            {/* Comparison Table */}

            <Card
                shadow="sm"
                radius="lg"
                className="overflow-hidden max-w-5xl h-fit mx-auto"
            >

                <Table
                    withTableBorder
                    withColumnBorders
                    verticalSpacing="xl"
                >

                    <Table.Thead>

                        <Table.Tr>

                            <Table.Th className="text-center font-bold">
                                Criteria
                            </Table.Th>

                            {
                                quotationList.map((quotation) => (

                                    <Table.Th
                                        key={quotation.id}
                                        className={`
                                            text-center
                                            ${quotation.isLowest
                                                ? "bg-green-600 text-white"
                                                : ""
                                            }
                                        `}
                                    >

                                        {quotation.vendor}

                                        {
                                            quotation.isLowest &&
                                            (
                                                <span className="block text-xs mt-1">
                                                    Lowest Price
                                                </span>
                                            )
                                        }

                                    </Table.Th>

                                ))
                            }

                        </Table.Tr>

                    </Table.Thead>

                    <Table.Tbody>

                        {
                            criteria.map((item) => (

                                <Table.Tr key={item.key}>

                                    <Table.Td className="font-medium">
                                        {item.label}
                                    </Table.Td>

                                    {
                                        quotationList.map((quotation) => (

                                            <Table.Td
                                                key={quotation.id}
                                                className={`
                                                    text-center
                                                    ${quotation.isLowest
                                                        ? "bg-green-50"
                                                        : ""
                                                    }
                                                `}
                                            >

                                                {
                                                    item.key === "total"
                                                        ? `₹${quotation[item.key].toLocaleString()}`
                                                        : item.key === "rating"
                                                            ? `${quotation[item.key]}/5`
                                                            : item.key === "gst"
                                                                ? `${quotation[item.key]}%`
                                                                : quotation[item.key]
                                                }

                                            </Table.Td>

                                        ))
                                    }

                                </Table.Tr>

                            ))
                        }

                        {/* Action Row */}

                        <Table.Tr>

                            <Table.Td />

                            {
                                quotationList.map((quotation) => (

                                    <Table.Td
                                        key={quotation.id}
                                        className={`
                                            text-center
                                            ${quotation.isLowest
                                                ? "bg-green-50"
                                                : ""
                                            }
                                        `}
                                    >

                                        <Button
                                            color={
                                                quotation.isLowest
                                                    ? "green"
                                                    : "blue"
                                            }
                                            variant={
                                                quotation.isLowest
                                                    ? "filled"
                                                    : "light"
                                            }
                                        >
                                            {
                                                quotation.isLowest
                                                    ? "Select & Approve"
                                                    : "Select"
                                            }
                                        </Button>

                                    </Table.Td>

                                ))
                            }

                        </Table.Tr>

                    </Table.Tbody>

                </Table>

            </Card>

        </div>
    )
}

export default Quotations