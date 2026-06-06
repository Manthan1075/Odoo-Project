import React from "react";
import {
    Input,
    Textarea
} from "@mantine/core";

function RFQDetails({
    rfqData,
    setRfqData
}) {
    return (
        <div className="grid md:grid-cols-2 gap-5 mt-6">

            <div>

                <label>
                    RFQ Title
                </label>

                <Input
                    value={rfqData.title}
                    onChange={(e) =>
                        setRfqData({
                            ...rfqData,
                            title: e.target.value
                        })
                    }
                />

            </div>

            <div>

                <label>
                    Category
                </label>

                <Input
                    value={rfqData.category}
                    onChange={(e) =>
                        setRfqData({
                            ...rfqData,
                            category: e.target.value
                        })
                    }
                />

            </div>

            <div>

                <label>
                    Deadline
                </label>

                <Input
                    type="date"
                    value={rfqData.deadline}
                    onChange={(e) =>
                        setRfqData({
                            ...rfqData,
                            deadline: e.target.value
                        })
                    }
                />

            </div>

            <div className="md:col-span-2">

                <label>
                    Description
                </label>

                <Textarea
                    rows={5}
                    value={rfqData.description}
                    onChange={(e) =>
                        setRfqData({
                            ...rfqData,
                            description: e.target.value
                        })
                    }
                />

            </div>

        </div>
    );
}

export default RFQDetails;