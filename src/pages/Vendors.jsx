import React from 'react'
import {
    Button,
    Input,
    Table,
    Badge,
    Card,
} from '@mantine/core'

import {
    Plus,
    Search
} from 'lucide-react'

import { Link } from 'react-router'

function Vendors() {

    const vendors = [
        {
            id: 1,
            name: "Infra Supplies Pvt Ltd",
            category: "Construction",
            gst: "27AABCS1429B2Z0",
            contact: "9876543210",
            status: "Active"
        },
        {
            id: 2,
            name: "Tech Core LTD",
            category: "IT",
            gst: "27AABCS1429B2Z0",
            contact: "9876543211",
            status: "Pending"
        },
        {
            id: 3,
            name: "FastLog Transport",
            category: "Logistics",
            gst: "27AABCS1429B2Z0",
            contact: "9876543212",
            status: "Blocked"
        }
    ]

    return (
        <div className="p-8 bg-slate-50 min-h-screen">

            {/* Header */}

            <div className="flex justify-between items-start mb-8">

                <div>

                    <h1 className="text-3xl font-bold text-slate-800">
                        Vendors
                    </h1>

                    <p className="text-slate-500 mt-1">
                        Manage supplier profiles and registrations
                    </p>

                </div>

                <Link to="/register">
                    <Button
                        leftSection={<Plus size={16} />}
                    >
                        Add Vendor
                    </Button>
                </Link>

            </div>

            {/* Search */}

            <Card
                shadow="sm"
                radius="lg"
                className="mb-6"
            >

                <Input
                    size="md"
                    leftSection={<Search size={18} />}
                    placeholder="Search by vendor name, GST number, category..."
                />

            </Card>

            {/* Filters */}

            <div className="flex flex-wrap gap-3 mb-6">

                <Button
                    variant="filled"
                    size="sm"
                >
                    All (23)
                </Button>

                <Button
                    variant="light"
                    color="green"
                    size="sm"
                >
                    Active (21)
                </Button>

                <Button
                    variant="light"
                    color="yellow"
                    size="sm"
                >
                    Pending (4)
                </Button>

                <Button
                    variant="light"
                    color="red"
                    size="sm"
                >
                    Blocked (3)
                </Button>

            </div>

            {/* Table */}

            <Card
                shadow="sm"
                radius="lg"
                p="md"
            >

                <Table
                    striped
                    highlightOnHover
                    verticalSpacing="md"
                >

                    <Table.Thead>

                        <Table.Tr>

                            <Table.Th>
                                Vendor Name
                            </Table.Th>

                            <Table.Th>
                                Category
                            </Table.Th>

                            <Table.Th>
                                GST No.
                            </Table.Th>

                            <Table.Th>
                                Contact No.
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
                            vendors.map((vendor) => (

                                <Table.Tr
                                    key={vendor.id}
                                >

                                    <Table.Td>
                                        {vendor.name}
                                    </Table.Td>

                                    <Table.Td>
                                        {vendor.category}
                                    </Table.Td>

                                    <Table.Td>
                                        {vendor.gst}
                                    </Table.Td>

                                    <Table.Td>
                                        {vendor.contact}
                                    </Table.Td>

                                    <Table.Td>

                                        <Badge
                                            color={
                                                vendor.status === "Active"
                                                    ? "green"
                                                    : vendor.status === "Pending"
                                                        ? "yellow"
                                                        : "red"
                                            }
                                            variant="light"
                                        >
                                            {vendor.status}
                                        </Badge>

                                    </Table.Td>

                                    <Table.Td>

                                        <Link
                                            to={`/vendor/${vendor.id}`}
                                        >

                                            <Button
                                                size="xs"
                                                variant="light"
                                            >
                                                View
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

export default Vendors