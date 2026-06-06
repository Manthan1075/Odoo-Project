import React, { useState } from "react";
import {
    Badge,
    Button,
    Card,
    Divider,
    Table
} from "@mantine/core";

function Invoices() {

    const [invoice] = useState({
        poNumber: "PO-2025-0068",
        poDate: "21 May 2025",

        invoiceDate: "22 May 2025",
        dueDate: "21 June 2025",

        status: "Pending Payment",

        customer: {
            companyName: "Your Organization Name",
            address: "123 Business Park, Ahmedabad",
            gst: "GSTIN123456789"
        },

        vendor: {
            companyName: "Infra Supplies Pvt Ltd",
            address: "456 Industrial Estate, Surat",
            gst: "GSTIN334343DB4523"
        },

        items: [
            {
                id: 1,
                name: "Ergonomic Chair",
                quantity: 25,
                unitPrice: 3500
            },
            {
                id: 2,
                name: "Standing Desk",
                quantity: 10,
                unitPrice: 8200
            }
        ],

        cgst: 9,
        sgst: 9
    });

    const subtotal = invoice.items.reduce(
        (acc, item) =>
            acc +
            item.quantity *
            item.unitPrice,
        0
    );

    const cgstAmount =
        (subtotal * invoice.cgst) / 100;

    const sgstAmount =
        (subtotal * invoice.sgst) / 100;

    const grandTotal =
        subtotal +
        cgstAmount +
        sgstAmount;

    return (
        <div className="p-8 bg-slate-50 min-h-screen">

            {/* Header */}

            <div className="flex justify-between items-start mb-8">

                <div>

                    <h1 className="text-3xl font-bold text-slate-800">
                        Purchase Order & Invoice
                    </h1>

                    <p className="text-slate-500 mt-2">
                        {invoice.poNumber} - Auto Generated After Approval
                    </p>

                </div>

                <div className="flex gap-3">

                    <Button variant="default">
                        Download PDF
                    </Button>

                    <Button variant="default">
                        Print
                    </Button>

                    <Button>
                        Email Invoice
                    </Button>

                </div>

            </div>

            {/* Billing Info */}

            <Card
                withBorder
                radius="lg"
                mb="xl"
            >

                <div className="grid md:grid-cols-2 gap-8">

                    <div>

                        <h3 className="font-semibold mb-3">
                            Bill To
                        </h3>

                        <p className="font-medium">
                            {invoice.customer.companyName}
                        </p>

                        <p>
                            {invoice.customer.address}
                        </p>

                        <p>
                            {invoice.customer.gst}
                        </p>

                    </div>

                    <div>

                        <h3 className="font-semibold mb-3">
                            Vendor
                        </h3>

                        <p className="font-medium">
                            {invoice.vendor.companyName}
                        </p>

                        <p>
                            {invoice.vendor.address}
                        </p>

                        <p>
                            {invoice.vendor.gst}
                        </p>

                    </div>

                </div>

                <Divider my="lg" />

                <div className="grid md:grid-cols-2 gap-8">

                    <div className="space-y-2">

                        <p>
                            <strong>
                                PO Number:
                            </strong>{" "}
                            {invoice.poNumber}
                        </p>

                        <p>
                            <strong>
                                PO Date:
                            </strong>{" "}
                            {invoice.poDate}
                        </p>

                    </div>

                    <div className="space-y-2">

                        <p>
                            <strong>
                                Invoice Date:
                            </strong>{" "}
                            {invoice.invoiceDate}
                        </p>

                        <p>
                            <strong>
                                Due Date:
                            </strong>{" "}
                            {invoice.dueDate}
                        </p>

                    </div>

                </div>

            </Card>

            {/* Items */}

            <Card
                withBorder
                radius="lg"
            >

                <Table
                    withTableBorder
                    withColumnBorders
                >

                    <Table.Thead>

                        <Table.Tr>

                            <Table.Th>
                                Item
                            </Table.Th>

                            <Table.Th>
                                Qty
                            </Table.Th>

                            <Table.Th>
                                Unit Price
                            </Table.Th>

                            <Table.Th>
                                Total
                            </Table.Th>

                        </Table.Tr>

                    </Table.Thead>

                    <Table.Tbody>

                        {
                            invoice.items.map(
                                (item) => (

                                    <Table.Tr
                                        key={item.id}
                                    >

                                        <Table.Td>
                                            {item.name}
                                        </Table.Td>

                                        <Table.Td>
                                            {
                                                item.quantity
                                            }
                                        </Table.Td>

                                        <Table.Td>
                                            ₹
                                            {item.unitPrice.toLocaleString()}
                                        </Table.Td>

                                        <Table.Td>
                                            ₹
                                            {(
                                                item.quantity *
                                                item.unitPrice
                                            ).toLocaleString()}
                                        </Table.Td>

                                    </Table.Tr>

                                )
                            )
                        }

                        <Table.Tr>

                            <Table.Td
                                colSpan={3}
                                className="text-right font-medium"
                            >
                                Subtotal
                            </Table.Td>

                            <Table.Td>
                                ₹
                                {subtotal.toLocaleString()}
                            </Table.Td>

                        </Table.Tr>

                        <Table.Tr>

                            <Table.Td
                                colSpan={3}
                                className="text-right font-medium"
                            >
                                CGST ({invoice.cgst}%)
                            </Table.Td>

                            <Table.Td>
                                ₹
                                {cgstAmount.toLocaleString()}
                            </Table.Td>

                        </Table.Tr>

                        <Table.Tr>

                            <Table.Td
                                colSpan={3}
                                className="text-right font-medium"
                            >
                                SGST ({invoice.sgst}%)
                            </Table.Td>

                            <Table.Td>
                                ₹
                                {sgstAmount.toLocaleString()}
                            </Table.Td>

                        </Table.Tr>

                        <Table.Tr>

                            <Table.Td
                                colSpan={3}
                                className="
                                text-right
                                font-bold
                                text-lg
                            "
                            >
                                Grand Total
                            </Table.Td>

                            <Table.Td
                                className="
                                font-bold
                                text-lg
                            "
                            >
                                ₹
                                {grandTotal.toLocaleString()}
                            </Table.Td>

                        </Table.Tr>

                    </Table.Tbody>

                </Table>

                <div className="flex items-center gap-3 mt-6">

                    <span className="font-medium">
                        Status:
                    </span>

                    <Badge
                        color={
                            invoice.status ===
                            "Paid"
                                ? "green"
                                : "yellow"
                        }
                    >
                        {invoice.status}
                    </Badge>

                    {
                        invoice.status !==
                            "Paid" && (
                            <Button
                                size="xs"
                                variant="light"
                                color="green"
                            >
                                Mark As Paid
                            </Button>
                        )
                    }

                </div>

            </Card>

        </div>
    );
}

export default Invoices;