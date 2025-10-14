import React, { useEffect, useMemo, useState } from "react";
import { Form, Input, Select, Checkbox, Button, Flex, Radio, InputNumber } from "antd";
import { daysInMonth, MONTH_NAMES, EVENT_TYPES } from "../utils/utils";
import TextArea from "antd/es/input/TextArea";

export default function EventForm({ onSubmit, initial, onCancel }) {
  const [form] = Form.useForm();

  const [yearOption, setYearOption] = useState(
    initial?.year === "unknown" ? "unknown" : "year"
  );

  console.log('Initial values:', initial);

  useEffect(() => {
    form.setFieldsValue(initial);
    if (initial?.year === "unknown") {
      setYearOption("unknown");
    } else {
      setYearOption("year");
    }
  }, [initial, form]);

  useEffect(() => {
    if (yearOption === "unknown") {
      form.setFieldsValue({ isRecurring: true });
    }
  }, [yearOption, form]);

  const currentYear = new Date().getFullYear();

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
    let values = form.getFieldsValue();

    // Normalize year based on option
    if (yearOption === "unknown") {
      values.year = "unknown";
    }

    console.log('Submitting with values:', form.getFieldsValue());
    await onSubmit(form.getFieldsValue());
    form.resetFields();
  };

  const formLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    layout: "horizontal",
  };

  const [loadingAI, setLoadingAI] = useState(false);

  async function handleAIDescription() {
    const { name, year, month, day } = form.getFieldsValue();
    if (!name) return alert("Please enter an event name first");

    const date =
      year === "unknown"
        ? `month ${month}, day ${day}`
        : `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    setLoadingAI(true);
    try {
      console.error("try");
      const res = await fetch("/.netlify/functions/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: name, date }),
      });
      console.error("res", res);

      const data = await res.json();
      console.error("data", data);
      if (data.text) {
        form.setFieldValue("note", data.text);
      } else {
        alert("AI did not return a description");
      }
    } catch (err) {
      console.error("AI request failed", err);
      alert("Failed to get AI suggestion");
    } finally {
      setLoadingAI(false);
    }
  }


  return (
    <Form
      form={form}
      initialValues={initial}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      layout="horizontal"
      onFinish={handleSubmit}
    >
      <Form.Item name="name" label="Event Name" rules={[{ required: true }]} placeholder="Enter event name">
        <Input />
      </Form.Item>

      <Form.Item name="note" label="Note" placeholder="Enter a note">
        <TextArea />
      </Form.Item>

      <Button
        type="dashed"
        onClick={handleAIDescription}
        disabled={loadingAI}
        className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-3 py-2 rounded-md flex items-center gap-2"
      >
        {/* <Sparkles size={16} /> */}
        {loadingAI ? "Thinking..." : "Suggest with AI"}
      </Button>

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
        }))} />
      </Form.Item>

      <Form.Item label="Day" name="day">
        <Select options={[...Array(daysCount)].map((_, i) => ({
          value: i + 1,
          label: i + 1
        }))} />
      </Form.Item>

      <Form.Item label="Year">
        <Radio.Group
          value={yearOption}
          onChange={(e) => {
            const val = e.target.value;
            setYearOption(val);
            if (val === "unknown") {
              form.setFieldsValue({ year: "unknown" });
            } else {
              form.setFieldsValue({ year: currentYear });
            }
          }}
        >
          <Radio value="year">
            <Form.Item
              noStyle
              name="year"
              rules={[
                {
                  required: yearOption === "year",
                  message: "Please enter year",
                },
              ]}
            >
              <InputNumber
                min={1900}
                max={currentYear + 50}
                style={{ width: 120, marginLeft: 8 }}
                disabled={yearOption !== "year"}
              />
            </Form.Item>
          </Radio>

          <Radio value="unknown">Unknown</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item name="isRecurring" valuePropName="checked" style={{ marginLeft: 118 }}>
        <Checkbox
          checked={yearOption === "unknown" ? true : undefined}
          disabled={yearOption === "unknown"}
        >Repeat every year</Checkbox>
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
