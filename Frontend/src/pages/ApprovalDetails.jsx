import React, { useState } from "react";
import {
    Button,
    Card,
    Stepper,
    Textarea,
    Badge
} from "@mantine/core";
import {
    CheckCircle,
    Clock3
} from "lucide-react";

function ApprovalDetails() {

    const [remarks, setRemarks] = useState("");

    const quotation = {
        rfqTitle: "Office Furniture Q2",
        vendor: "Infra Supplies Pvt Ltd",
        amount: 185400,
        deliveryDays: 10,
        rating: 4.5,
        gst: 18,
        status: "Pending"
    };

    const approvalChain = [
        {
            id: 1,
            name: "Rahul Mehta",
            role: "Procurement Officer",
            status: "Approved",
            date: "20 May 2025, 10:32 AM"
        },
        {
            id: 2,
            name: "Current Officer",
            role: "Procurement Officer",
            status: "Awaiting",
            date: "Assigned Today"
        }
    ];

    const handleApprove = () => {
        console.log({
            quotationId: 1,
            remarks,
            action: "approved"
        });
    };

    const handleReject = () => {
        console.log({
            quotationId: 1,
            remarks,
            action: "rejected"
        });
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">

            <div className="mb-8">

                <h1 className="text-3xl font-bold">
                    Approval Workflow
                </h1>

                <p className="text-slate-500 mt-2">
                    RFQ: {quotation.rfqTitle}
                </p>

            </div>

            {/* Stepper */}

            <Card
                withBorder
                radius="lg"
                mb="xl"
            >

                <Stepper
                    active={2}
                    allowNextStepsSelect={false}
                >

                    <Stepper.Step
                        label="1"
                        description="Submitted"
                    />

                    <Stepper.Step
                        label="2"
                        description="Quotation Received"
                    />

                    <Stepper.Step
                        label="3"
                        description="Officer Approval"
                    />

                    <Stepper.Step
                        label="4"
                        description="Generate PO"
                    />

                </Stepper>

            </Card>

            <div className="grid md:grid-cols-2 gap-6">

                {/* Approval Chain */}

                <Card
                    withBorder
                    radius="lg"
                >

                    <h3 className="font-semibold text-lg mb-5">
                        Approval Chain
                    </h3>


                    <div className="mt-6">

                        <h4 className="font-medium mb-2">
                            Approval Remarks
                        </h4>

                        <Textarea
                            rows={5}
                            placeholder="
Add your comments or conditions..."
                            value={remarks}
                            onChange={(e) =>
                                setRemarks(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                </Card>

                {/* Quotation Summary */}

                <Card
                    withBorder
                    radius="lg"
                >

                    <h3 className="font-semibold text-lg mb-5">
                        Quotation Summary
                    </h3>

                    <div className="space-y-4">

                        <div className="flex justify-between">
                            <span>Vendor</span>
                            <span>{quotation.vendor}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Total Amount</span>
                            <span>
                                ₹{quotation.amount.toLocaleString()}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span>GST</span>
                            <span>{quotation.gst}%</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Delivery</span>
                            <span>
                                {quotation.deliveryDays} Days
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span>Vendor Rating</span>
                            <span>
                                {quotation.rating}/5
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span>Status</span>

                            <Badge color="yellow">
                                Pending
                            </Badge>
                        </div>

                    </div>

                    <div className="flex gap-4 mt-8">

                        <Button
                            color="green"
                            fullWidth
                            onClick={handleApprove}
                        >
                            Approve
                        </Button>

                        <Button
                            color="red"
                            variant="light"
                            fullWidth
                            onClick={handleReject}
                        >
                            Reject
                        </Button>

                    </div>

                </Card>

            </div>

        </div>
    );
}

export default ApprovalDetails;