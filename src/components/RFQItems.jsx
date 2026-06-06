import React, { useState } from "react";
import {
    Button,
    Input,
    Modal,
    Select,
    Table
} from "@mantine/core";

function RFQItems({
    rfqData,
    setRfqData
}) {

    const [opened, setOpened] =
        useState(false);

    const [item, setItem] =
        useState({
            itemName: "",
            quantity: "",
            unit: ""
        });

    const handleAddItem = () => {

        setRfqData((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                item
            ]
        }));

        setItem({
            itemName: "",
            quantity: "",
            unit: ""
        });

        setOpened(false);
    };

    return (
        <div className="mt-6">

            <Button
                onClick={() =>
                    setOpened(true)
                }
            >
                Add Item
            </Button>

            <Table mt="md">

                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>
                            Item
                        </Table.Th>

                        <Table.Th>
                            Quantity
                        </Table.Th>

                        <Table.Th>
                            Unit
                        </Table.Th>
                    </Table.Tr>
                </Table.Thead>

                <Table.Tbody>

                    {
                        rfqData.items.map(
                            (
                                item,
                                index
                            ) => (
                                <Table.Tr
                                    key={index}
                                >
                                    <Table.Td>
                                        {
                                            item.itemName
                                        }
                                    </Table.Td>

                                    <Table.Td>
                                        {
                                            item.quantity
                                        }
                                    </Table.Td>

                                    <Table.Td>
                                        {
                                            item.unit
                                        }
                                    </Table.Td>
                                </Table.Tr>
                            )
                        )
                    }

                </Table.Tbody>

            </Table>

            <Modal
                opened={opened}
                onClose={() =>
                    setOpened(false)
                }
                title="Add Item"
            >

                <Input
                    mb="md"
                    placeholder="Item Name"
                    value={item.itemName}
                    onChange={(e) =>
                        setItem({
                            ...item,
                            itemName:
                                e.target.value
                        })
                    }
                />

                <Input
                    mb="md"
                    type="number"
                    placeholder="Quantity"
                    value={item.quantity}
                    onChange={(e) =>
                        setItem({
                            ...item,
                            quantity:
                                e.target.value
                        })
                    }
                />

                <Select
                    mb="md"
                    placeholder="Select Unit"
                    data={[
                        "Nos",
                        "Kg",
                        "Box"
                    ]}
                    value={item.unit}
                    onChange={(value) =>
                        setItem({
                            ...item,
                            unit: value
                        })
                    }
                />

                <Button
                    fullWidth
                    onClick={
                        handleAddItem
                    }
                >
                    Save Item
                </Button>

            </Modal>

        </div>
    );
}

export default RFQItems;