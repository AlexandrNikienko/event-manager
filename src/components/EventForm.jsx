import React, { useState, useEffect, useMemo } from "react";
import { Form, Input, Select, Checkbox, Button, Flex } from "antd";

import { daysInMonth, MONTH_NAMES } from "../utils";
import { EVENT_TYPES } from "../utils/eventIcons";
import TextArea from "antd/es/input/TextArea";

export default function EventForm({ onSubmit, initial, onCancel }) {
  const [form] = Form.useForm();

  console.log('Initial values:', initial);

  useEffect(() => {
    form.setFieldsValue(initial);
  }, [initial, form]);

  // // Years for select
  const currentYear = new Date().getFullYear();
  const years = ["unknown", ...Array.from({ length: 151 }, (_, i) => currentYear - 100 + i)];

  // Watch form values
  const month = Form.useWatch("month", form) || 1;
  const year = Form.useWatch("year", form) || "unknown";
  const day = Form.useWatch("day", form) || 1;

  // Calculate days count based on month + year
  const daysCount = useMemo(() => {
    if (year === "unknown" && month === 2) return 29;
    if (year === "unknown") return daysInMonth(month, 2024);
    return daysInMonth(month, Number(year));
  }, [month, year]);

  // Auto-correct day if invalid
  useEffect(() => {
    if (day > daysCount) {
      form.setFieldsValue({ day: daysCount });
    }
  }, [day, daysCount, form]);

  const handleSubmit = async (e) => {
    console.log('Submitting with values:', form.getFieldsValue());

    await onSubmit(form.getFieldsValue());

    form.resetFields();
  };

  const formLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    layout: "horizontal",
  };

  return (
    <Form
      form={form}
      {...formLayout}
      initialValues={initial}
      onFinish={handleSubmit}
    >
      <Form.Item name="name" label="Event Name" rules={[{ required: true }]} placeholder="Enter event name">
        <Input />
      </Form.Item>

      <Form.Item name="note" label="Note" placeholder="Enter a note">
        <TextArea />
      </Form.Item>

      <Form.Item label="Type" name="type">
        <Select options={EVENT_TYPES.map(t => ({
          value: t.value,
          label: `${t.icon} ${t.label}`,
        }))} />
      </Form.Item>

      <Form.Item label="Month" name="month">
        <Select options={MONTH_NAMES.map((m, i) => ({
          value: i + 1,
          label: m,
        }))}/>
      </Form.Item>

      <Form.Item label="Day" name="day">
        <Select options={[...Array(daysCount)].map((_, i) => ({
          value: i + 1,
          label: i + 1
        }))}/>
      </Form.Item>

      <Form.Item label="Year" name="year">
        <Select options={years.map(y => ({
          value: y,
          label: y === "unknown" ? "Unknown" : y
        }))}/>
      </Form.Item>

      <Form.Item name="isRecurring" valuePropName="checked">
        <Checkbox>Repeat every year</Checkbox>
      </Form.Item>

      <Flex gap="small" justify="end" style={{ marginTop: 20 }}>
        <Button onClick={() => {
          onCancel && onCancel();
          form.resetFields();
        }}
          variant="outlined"
        >
          Cancel
        </Button>

        <Button htmlType="submit" type="primary">Save</Button>
      </Flex>
    </Form>
  );
}
