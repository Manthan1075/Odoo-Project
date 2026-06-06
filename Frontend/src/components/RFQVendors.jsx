import React from "react";
import {
    Button,
    Table,
    Badge
} from "@mantine/core";

import {
    Trash2
} from "lucide-react";

function RFQVendors({
    rfqData,
    setRfqData
}) {

    const vendorList = [
        {
            id: "1",
            companyName: "Google"
        },
        {
            id: "2",
            companyName: "Facebook"
        },
        {
            id: "3",
            companyName: "Microsoft"
        }
    ];

    const assignVendor = (
        vendor
    ) => {

        const exists =
            rfqData.vendors.find(
                (v) =>
                    v.id ===
                    vendor.id
            );

        if (exists) return;

        setRfqData((prev) => ({
            ...prev,
            vendors: [
                ...prev.vendors,
                vendor
            ]
        }));
    };

    const removeVendor = (
        id
    ) => {

        setRfqData((prev) => ({
            ...prev,
            vendors:
                prev.vendors.filter(
                    (
                        vendor
                    ) =>
                        vendor.id !==
                        id
                )
        }));

    };

    return (
        <div className="mt-6 space-y-8">

            {/* Vendor List */}

            <div>

                <h3
                    className="
                    text-lg
                    font-semibold
                    mb-4
                "
                >
                    Available Vendors
                </h3>

                <Table
                    striped
                    highlightOnHover
                    withTableBorder
                >

                    <Table.Thead>

                        <Table.Tr>

                            <Table.Th>
                                Vendor Name
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
                            vendorList.map(
                                (
                                    vendor
                                ) => {

                                    const assigned =
                                        rfqData.vendors.some(
                                            (
                                                v
                                            ) =>
                                                v.id ===
                                                vendor.id
                                        )

                                    return (

                                        <Table.Tr
                                            key={
                                                vendor.id
                                            }
                                        >

                                            <Table.Td>

                                                {
                                                    vendor.companyName
                                                }

                                            </Table.Td>

                                            <Table.Td>

                                                {
                                                    assigned
                                                        ? (
                                                            <Badge
                                                                color="green"
                                                            >
                                                                Assigned
                                                            </Badge>
                                                        )
                                                        : (
                                                            <Badge
                                                                color="gray"
                                                            >
                                                                Available
                                                            </Badge>
                                                        )
                                                }

                                            </Table.Td>

                                            <Table.Td>

                                                <Button
                                                    size="xs"
                                                    disabled={
                                                        assigned
                                                    }
                                                    onClick={() =>
                                                        assignVendor(
                                                            vendor
                                                        )
                                                    }
                                                >
                                                    Assign
                                                </Button>

                                            </Table.Td>

                                        </Table.Tr>

                                    )

                                }
                            )
                        }

                    </Table.Tbody>

                </Table>

            </div>

            {/* Assigned Vendors */}

            <div>

                <h3
                    className="
                    text-lg
                    font-semibold
                    mb-4
                    "
                >
                    Assigned Vendors
                </h3>

                {
                    rfqData.vendors.length === 0
                        ? (
                            <div
                                className="
                                border
                                rounded-lg
                                p-6
                                text-center
                                text-slate-500
                                "
                            >
                                No vendors assigned
                            </div>
                        )
                        : (
                            <div
                                className="
                                space-y-3
                                "
                            >

                                {
                                    rfqData.vendors.map(
                                        (
                                            vendor
                                        ) => (

                                            <div
                                                key={
                                                    vendor.id
                                                }
                                                className="
                                                flex
                                                justify-between
                                                items-center
                                                border
                                                rounded-xl
                                                p-4
                                                bg-slate-50
                                                "
                                            >

                                                <div>

                                                    <p
                                                        className="
                                                        font-medium
                                                        "
                                                    >
                                                        {
                                                            vendor.companyName
                                                        }
                                                    </p>

                                                </div>

                                                <Button
                                                    color="red"
                                                    variant="light"
                                                    size="xs"
                                                    leftSection={
                                                        <Trash2 size={16} />
                                                    }
                                                    onClick={() =>
                                                        removeVendor(
                                                            vendor.id
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </Button>

                                            </div>

                                        )
                                    )

                                }

                            </div>
                        )

                }

            </div>

        </div>
    );
}

export default RFQVendors;