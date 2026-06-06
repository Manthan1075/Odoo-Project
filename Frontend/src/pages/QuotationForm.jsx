import React, { useEffect, useState } from 'react'
import {
  Button,
  Input,
  Modal,
  NumberInput,
  Table,
  Textarea,
  Loader
} from '@mantine/core'

import {
  Plus,
  Trash2
} from 'lucide-react'

import { toast } from 'react-toastify'
import { useParams } from 'react-router'

import { createQuotation } from '../api/quotationApi'

function QuotationForm() {

  const { rfqId } = useParams()

  const [opened, setOpened] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  const [quotationData, setQuotationData] =
    useState({
      items: [],
      gst: 18,
      notes: "",
      payment_terms: ""
    })

  const [item, setItem] =
    useState({
      itemName: "",
      quantity: 1,
      unitPrice: 0,
      deliveryDays: 1
    })

  useEffect(() => {

    const draft =
      localStorage.getItem(
        "quotationDraft"
      )

    if (draft) {

      setQuotationData(
        JSON.parse(draft)
      )

    }

  }, [])

  const addItem = () => {

    if (!item.itemName.trim()) {

      toast.error(
        "Item Name is required"
      )

      return

    }

    if (item.quantity <= 0) {

      toast.error(
        "Quantity must be greater than 0"
      )

      return

    }

    if (item.unitPrice <= 0) {

      toast.error(
        "Unit Price must be greater than 0"
      )

      return

    }

    const newItem = {

      ...item,

      total:
        Number(item.quantity) *
        Number(item.unitPrice)

    }

    setQuotationData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        newItem
      ]
    }))

    setItem({
      itemName: "",
      quantity: 1,
      unitPrice: 0,
      deliveryDays: 1
    })

    setOpened(false)

    toast.success(
      "Item Added Successfully"
    )

  }

  const deleteItem = (index) => {

    setQuotationData(prev => ({
      ...prev,
      items:
        prev.items.filter(
          (_, i) =>
            i !== index
        )
    }))

    toast.success(
      "Item Removed"
    )

  }

  const subtotal =
    quotationData.items.reduce(
      (acc, item) =>
        acc + item.total,
      0
    )

  const gstAmount =
    (
      subtotal *
      quotationData.gst
    ) / 100

  const grandTotal =
    subtotal + gstAmount

  const handleSaveDraft = () => {

    localStorage.setItem(
      "quotationDraft",
      JSON.stringify(
        quotationData
      )
    )

    toast.success(
      "Draft Saved Successfully"
    )

  }

  const handleSubmit =
    async (e) => {

      e.preventDefault()

      try {

        if (
          quotationData.items.length === 0
        ) {

          toast.error(
            "Please Add At Least One Item"
          )

          return

        }

        setLoading(true)

        const payload = {

          items:
            quotationData.items.map(
              (item) => ({
                item_name:
                  item.itemName,
                quantity:
                  item.quantity,
                unit_price:
                  item.unitPrice,
                total_price:
                  item.total,
                delivery_days:
                  item.deliveryDays
              })
            ),

          delivery_days:
            Math.max(
              ...quotationData.items.map(
                item =>
                  item.deliveryDays
              )
            ),

          payment_terms:
            quotationData.payment_terms,

          notes:
            quotationData.notes,

          gst:
            quotationData.gst

        }

        const res =
          await createQuotation(
            rfqId,
            payload
          )

        toast.success(
          res?.message ||
          "Quotation Submitted Successfully"
        )

        localStorage.removeItem(
          "quotationDraft"
        )

        setQuotationData({
          items: [],
          gst: 18,
          notes: "",
          payment_terms: ""
        })

      } catch (error) {

        toast.error(
          error?.message ||
          "Failed To Submit Quotation"
        )

      } finally {

        setLoading(false)

      }

    }

  if (loading) {

    return (

      <div className="
        min-h-screen
        flex
        justify-center
        items-center
      ">

        <Loader size="lg" />

      </div>

    )

  }

  return (

    <div className="p-8 bg-slate-50 min-h-screen">

      {/* Header */}

      <div className="mb-6">

        <h1 className="text-3xl font-bold text-slate-800">
          Submit Quotation
        </h1>

        <p className="text-slate-500 mt-1">
          RFQ ID : {rfqId}
        </p>

      </div>

      <form
        onSubmit={handleSubmit}
        className="
          bg-white
          border
          border-slate-200
          rounded-xl
          p-6
          space-y-6
        "
      >

        {/* RFQ Summary */}

        <div
          className="
            border
            border-slate-200
            rounded-xl
            p-4
            bg-slate-50
          "
        >

          <h3 className="font-semibold text-lg">
            RFQ Summary
          </h3>

          <p className="text-slate-500 mt-2">
            Fill quotation details
            and submit your pricing.
          </p>

        </div>

        {/* Add Item */}

        <div>

          <div className="
            flex
            justify-between
            items-center
            mb-4
          ">

            <h3 className="font-semibold text-lg">
              Quotation Items
            </h3>

            <Button
              type="button"
              leftSection={
                <Plus size={16} />
              }
              onClick={() =>
                setOpened(true)
              }
            >
              Add Item
            </Button>

          </div>

          <Table
            withTableBorder
            withColumnBorders
            striped
          >

            <Table.Thead>

              <Table.Tr>

                <Table.Th>
                  Item Name
                </Table.Th>

                <Table.Th>
                  Quantity
                </Table.Th>

                <Table.Th>
                  Unit Price
                </Table.Th>

                <Table.Th>
                  Total
                </Table.Th>

                <Table.Th>
                  Delivery Days
                </Table.Th>

                <Table.Th>
                  Action
                </Table.Th>

              </Table.Tr>

            </Table.Thead>

            <Table.Tbody>

              {
                quotationData.items.length > 0
                  ? (
                    quotationData.items.map(
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
                            ₹
                            {
                              item.unitPrice
                            }
                          </Table.Td>

                          <Table.Td>
                            ₹
                            {
                              item.total
                            }
                          </Table.Td>

                          <Table.Td>
                            {
                              item.deliveryDays
                            }
                          </Table.Td>

                          <Table.Td>

                            <Button
                              size="xs"
                              color="red"
                              variant="light"
                              onClick={() =>
                                deleteItem(
                                  index
                                )
                              }
                            >
                              <Trash2
                                size={15}
                              />
                            </Button>

                          </Table.Td>

                        </Table.Tr>

                      )
                    )
                  )
                  : (
                    <Table.Tr>

                      <Table.Td
                        colSpan={6}
                        className="
                          text-center
                          py-5
                        "
                      >
                        No Items Added
                      </Table.Td>

                    </Table.Tr>
                  )
              }

            </Table.Tbody>

          </Table>

        </div>

        {/* Terms */}

        <div className="
          grid
          md:grid-cols-2
          gap-6
        ">

          <div>

            <label>
              GST %
            </label>

            <Input
              mt={5}
              value={
                quotationData.gst
              }
              onChange={(e) =>
                setQuotationData(
                  prev => ({
                    ...prev,
                    gst:
                      Number(
                        e.target.value
                      )
                  })
                )
              }
            />

            <div className="mt-4">

              <label>
                Payment Terms
              </label>

              <Textarea
                rows={4}
                mt={5}
                placeholder="
Payment within 30 days
"
                value={
                  quotationData.payment_terms
                }
                onChange={(e) =>
                  setQuotationData(
                    prev => ({
                      ...prev,
                      payment_terms:
                        e.target.value
                    })
                  )
                }
              />

            </div>

            <div className="mt-4">

              <label>
                Notes
              </label>

              <Textarea
                rows={4}
                mt={5}
                placeholder="
Additional notes
"
                value={
                  quotationData.notes
                }
                onChange={(e) =>
                  setQuotationData(
                    prev => ({
                      ...prev,
                      notes:
                        e.target.value
                    })
                  )
                }
              />

            </div>

          </div>

          {/* Summary */}

          <div
            className="
              border
              rounded-xl
              p-5
            "
          >

            <div className="
              flex
              justify-between
              mb-3
            ">

              <span>
                Subtotal
              </span>

              <span>
                ₹
                {
                  subtotal.toLocaleString()
                }
              </span>

            </div>

            <div className="
              flex
              justify-between
              mb-3
            ">

              <span>
                GST (
                {
                  quotationData.gst
                }
                %)
              </span>

              <span>
                ₹
                {
                  gstAmount.toLocaleString()
                }
              </span>

            </div>

            <hr />

            <div
              className="
                flex
                justify-between
                mt-4
                text-lg
                font-bold
              "
            >

              <span>
                Grand Total
              </span>

              <span>
                ₹
                {
                  grandTotal.toLocaleString()
                }
              </span>

            </div>

          </div>

        </div>

        {/* Actions */}

        <div className="flex gap-3">

          <Button
            type="submit"
            loading={loading}
          >
            Submit Quotation
          </Button>

          <Button
            type="button"
            variant="default"
            onClick={
              handleSaveDraft
            }
          >
            Save Draft
          </Button>

        </div>

      </form>

      {/* Add Item Modal */}

      <Modal
        opened={opened}
        onClose={() =>
          setOpened(false)
        }
        title="Add Quotation Item"
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

        <NumberInput
          label="Quantity"
          mb="md"
          value={item.quantity}
          onChange={(value) =>
            setItem({
              ...item,
              quantity:
                value || 1
            })
          }
        />

        <NumberInput
          label="Unit Price"
          mb="md"
          value={
            item.unitPrice
          }
          onChange={(value) =>
            setItem({
              ...item,
              unitPrice:
                value || 0
            })
          }
        />

        <NumberInput
          label="Delivery Days"
          mb="md"
          value={
            item.deliveryDays
          }
          onChange={(value) =>
            setItem({
              ...item,
              deliveryDays:
                value || 1
            })
          }
        />

        <Button
          fullWidth
          onClick={addItem}
        >
          Save Item
        </Button>

      </Modal>

    </div>

  )
}

export default QuotationForm