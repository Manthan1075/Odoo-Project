import React, { useState } from 'react'
import {
    Badge,
    Button,
    Card,
    Table
} from '@mantine/core'
import { Link } from 'react-router'

function Approvals() {

    const [approvalList, setApprovalList] = useState([
        {
            id: 1,
            rfqTitle: "Office Furniture Q2",
            vendor: "Infra Supplies Pvt Ltd",
            amount: 185400,
            requestedBy: "Rahul Mehta",
            level: "L2 Approval",
            status: "Pending"
        },
        {
            id: 2,
            rfqTitle: "IT Equipment Purchase",
            vendor: "Tech Core LTD",
            amount: 325000,
            requestedBy: "Priya Shah",
            level: "L1 Approval",
            status: "Pending"
        },
        {
            id: 3,
            rfqTitle: "Transport Contract",
            vendor: "FastLog Transport",
            amount: 97500,
            requestedBy: "Amit Patel",
            level: "Finance Approval",
            status: "Pending"
        }
    ])

    const handleApprove = (id) => {

        setApprovalList(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, status: "Approved" }
                    : item
            )
        )

    }

    const handleReject = (id) => {

        setApprovalList(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, status: "Rejected" }
                    : item
            )
        )

    }

    return (
        <div className="p-8 bg-slate-50 min-h-screen">

            <div className="mb-8">

                <h1 className="text-3xl font-bold text-slate-800">
                    Approval Workflow
                </h1>

                <p className="text-slate-500 mt-2">
                    Review and approve procurement requests
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
                >

                    <Table.Thead>

                        <Table.Tr>

                            <Table.Th>
                                RFQ
                            </Table.Th>

                            <Table.Th>
                                Vendor
                            </Table.Th>

                            <Table.Th>
                                Amount
                            </Table.Th>

                            <Table.Th>
                                Requested By
                            </Table.Th>

                            <Table.Th>
                                Status
                            </Table.Th>

                            <Table.Th>
                                Actions
                            </Table.Th>

                        </Table.Tr>

                    </Table.Thead>

                    <Table.Tbody>

                        {
                            approvalList.map(item => (

                                <Table.Tr
                                    key={item.id}
                                >

                                    <Table.Td>
                                        {item.rfqTitle}
                                    </Table.Td>

                                    <Table.Td>
                                        {item.vendor}
                                    </Table.Td>

                                    <Table.Td>
                                        ₹{item.amount.toLocaleString()}
                                    </Table.Td>

                                    <Table.Td>
                                        {item.requestedBy}
                                    </Table.Td>


                                    <Table.Td>

                                        <Badge
                                            color={
                                                item.status === "Approved"
                                                    ? "green"
                                                    : item.status === "Rejected"
                                                        ? "red"
                                                        : "yellow"
                                            }
                                        >
                                            {item.status}
                                        </Badge>

                                    </Table.Td>

                                    <Table.Td>

                                        <div className="flex gap-2">

                                            <Button>
                                                <Link to={"/approval-detail/5"}>
                                                    View
                                                </Link>
                                            </Button>

                                        </div>

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

export default Approvals