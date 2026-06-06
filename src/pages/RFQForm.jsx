import React, { useState } from "react";
import { Button, Stepper } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";

import RFQDetails from "../components/RFQDetails";
import RFQItems from "../components/RFQItems";
import RFQVendors from "../components/RFQVendors";

function RFQForm() {
    const [active, setActive] = useState(0);

    const [rfqData, setRfqData] = useState({
        title: "",
        category: "",
        deadline: "",
        description: "",
        items: [],
        vendors: [],
        attachments: []
    });

    const handleNext = () => {
        setActive((prev) => (prev < 2 ? prev + 1 : prev));
    };

    const handlePrevious = () => {
        setActive((prev) => (prev > 0 ? prev - 1 : prev));
    };

    const handleSubmit = () => {
        console.log(rfqData);
    };

    return (
        <div className="p-8">

            <div className="bg-white p-6 rounded-xl border">

                <h1 className="text-2xl font-bold">
                    Create RFQ
                </h1>

                <p className="text-slate-500 mb-6">
                    Create new request for quotation
                </p>

                <Stepper active={active}>

                    <Stepper.Step
                        label="1"
                        description="Add Details"
                    >
                        <RFQDetails
                            rfqData={rfqData}
                            setRfqData={setRfqData}
                        />
                    </Stepper.Step>

                    <Stepper.Step
                        label="2"
                        description="Add Items"
                    >
                        <RFQItems
                            rfqData={rfqData}
                            setRfqData={setRfqData}
                        />
                    </Stepper.Step>

                    <Stepper.Step
                        label="3"
                        description="Assign Vendors"
                    >
                        <RFQVendors
                            rfqData={rfqData}
                            setRfqData={setRfqData}
                        />
                    </Stepper.Step>

                </Stepper>

                <div className="mt-8">

                    <h3 className="mb-2 font-semibold">
                        Attachments
                    </h3>

                    <Dropzone
                        onDrop={(files) =>
                            setRfqData((prev) => ({
                                ...prev,
                                attachments: files
                            }))
                        }
                    >
                        <div className="p-10 text-center">
                            Drag & Drop files here
                        </div>
                    </Dropzone>

                </div>

                <div className="flex gap-3 mt-8">

                    <Button
                        variant="default"
                        onClick={handlePrevious}
                    >
                        Previous
                    </Button>

                    {
                        active < 2 && (
                            <Button
                                onClick={handleNext}
                            >
                                Next
                            </Button>
                        )
                    }

                    {
                        active === 2 && (
                            <>
                                <Button
                                    color="gray"
                                >
                                    Save Draft
                                </Button>

                                <Button
                                    onClick={handleSubmit}
                                >
                                    Save & Send To Vendor
                                </Button>
                            </>
                        )
                    }

                </div>

            </div>

        </div>
    );
}

export default RFQForm;