import React, { useEffect, useState } from "react";
import { Form, Input, Select, Checkbox, Button, Flex } from "antd";
import { Sparkles } from "lucide-react";
import { EVENT_TYPES } from "../utils/utils";
import TextArea from "antd/es/input/TextArea";
import DatePicker from "./DatePicker";

export default function EventForm({ onSubmit, initialEvent, onCancel }) {
  const [form] = Form.useForm();

  const [yearOption, setYearOption] = useState(
    initialEvent?.year === "unknown" ? "unknown" : "year"
  );

  const [selectedDate, setSelectedDate] = useState({
    year: initialEvent?.year,
    month: initialEvent?.month - 1,
    day: initialEvent?.day,
  });

  const date = Form.useWatch("date", form) || {};

  useEffect(() => {
    console.log('Selected date changed:', selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    //console.log('Setting form values to:', initialEvent);
    form.setFieldsValue(initialEvent);
    if (initialEvent?.year === "unknown") {
      setYearOption("unknown");
    } else {
      setYearOption("year");
    }
    setSelectedDate({
      year: initialEvent?.year,
      month: initialEvent?.month - 1,
      day: initialEvent?.day,
    })
    //console.log('Initial values:', initialEvent);
  }, [initialEvent, form]);

  useEffect(() => {
    setYearOption(date.year === "unknown" ? "unknown" : "year");
    if (date?.year === "unknown") {
      form.setFieldsValue({ isRecurring: true });
    }
  }, [date, form]);

  const handleSubmit = async (e) => {
    let values = form.getFieldsValue();
    values = {
      ...values,
      ...selectedDate
    };
    values.month = values.month + 1; // Adjust month from 0-11 to 1-12
    delete values.date;

    if (yearOption === "unknown") {
      values.year = "unknown";
    }

    console.log('Submitting with values:', values);
    //return
    await onSubmit(values);
    form.resetFields();
  };

  const formLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    layout: "horizontal",
  };

  const [loadingAI, setLoadingAI] = useState(false);

  async function handleAIDescription() {
    const { name, year, month, day, type } = form.getFieldsValue();
    if (!name) return alert("Please enter an event name first");

    const date =
      year === "unknown"
        ? `month ${month}, day ${day}`
        : `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    setLoadingAI(true);

    try {
      const res = await fetch("/.netlify/functions/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: name, date, type }),
      });

      const data = await res.json();
      console.log("AI response data:", data);

      if (data.note) {
        form.setFieldValue("note", data.note);
      } else {
        alert("AI did not return a note");
      }
    } catch (err) {
      console.error("AI request failed", err);
    } finally {
      setLoadingAI(false);
    }
  }


  return (
    <Form
      form={form}
      initialValues={initialEvent}
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

      {/* <Button
        type="dashed"
        onClick={handleAIDescription}
        disabled={loadingAI}
      >
        <Sparkles size={16} />
        {loadingAI ? "Thinking..." : "Suggest with AI"}
      </Button> */}

      <Form.Item label="Type" name="type" rules={[{ required: true }]} placeholder="Enter a type">
        <Select options={EVENT_TYPES.map(t => ({
          value: t.value,
          label: `${t.icon} ${t.label}`,
        }))} />
      </Form.Item>

      <Form.Item label="Date" name="date">
        <DatePicker
          date={selectedDate}
          onChange={setSelectedDate}
        />
      </Form.Item>

      <Form.Item name="isRecurring" valuePropName="checked" style={{ marginLeft: 118 }}>
        <Checkbox
          checked={selectedDate.year === "unknown" ? true : undefined}
          disabled={selectedDate.year === "unknown"}
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
