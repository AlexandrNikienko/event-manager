import React, { useEffect, useState } from "react";
import { Form, Input, Select, Checkbox, Button, Flex } from "antd";
import { Sparkles } from "lucide-react";
import { EVENT_TYPES } from "../utils/utils";
import TextArea from "antd/es/input/TextArea";
import DatePicker from "./DatePicker";

export default function EventForm({ onSubmit, initialEvent, onCancel }) {

  const [form] = Form.useForm();
  
  const today = new Date();

  const [yearOption, setYearOption] = useState(
    initialEvent?.year === "unknown" ? "unknown" : "year"
  );

  const [selectedDate, setSelectedDate] = useState(
    initialEvent?.startDate ? {
      year: initialEvent.startDate?.year,
      month: initialEvent.startDate?.month - 1,
      day: initialEvent.startDate?.day,
    } : {
      year: today.getFullYear(),
      month: today.getMonth(),
      day: today.getDate(),
    }
  );

  const [isMultipleDays, setIsMultipleDays] = useState(
    initialEvent?.isMultiDay ? true : false
  );
  
  const defaultDate = {
    year: today.getFullYear(),
    month: today.getMonth(),
    day: today.getDate(),
  };
  
  const [startDate, setStartDate] = useState(
    initialEvent?.startDate ? {
      year: initialEvent.startDate?.year,
      month: initialEvent.startDate?.month - 1,
      day: initialEvent.startDate.day,
    } : defaultDate
  );
  const [endDate, setEndDate] = useState(
    initialEvent?.endDate ? {
      year: initialEvent.endDate.year,
      month: initialEvent.endDate.month - 1,
      day: initialEvent.endDate.day,
    } : defaultDate
  );

  const date = Form.useWatch("date", form) || {};

  useEffect(() => {
    console.log('Selected date changed:', selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    //console.log('Setting form values to:', initialEvent);
    form.setFieldsValue({
      ...initialEvent,
      reminderTime: initialEvent?.reminderTime || null, // Explicitly set reminder field
    });
    if (initialEvent?.year === "unknown") {
      setYearOption("unknown");
    } else {
      setYearOption("year");
    }
    
    // Update multi-day event state if initialEvent has multi-day data
    if (initialEvent?.isMultiDay) {
      setIsMultipleDays(true);
      if (initialEvent?.startDate) {
        setStartDate({
          year: initialEvent.startDate?.year,
          month: initialEvent.startDate?.month - 1,
          day: initialEvent.startDate.day,
        });
      }
      if (initialEvent?.endDate) {
        setEndDate({
          year: initialEvent.endDate.year,
          month: initialEvent.endDate.month - 1,
          day: initialEvent.endDate.day,
        });
      }
    } else {
      setIsMultipleDays(false);
      if (initialEvent?.startDate) {
        setSelectedDate({
          year: initialEvent.startDate?.year,
          month: initialEvent.startDate?.month - 1,
          day: initialEvent.startDate?.day,
        });
      }
    }
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
    
    if (isMultipleDays) {
      if (!startDate?.day || !endDate?.day) {
        return alert("Please select both start and end dates for multi-day event");
      }
      values.isMultiDay = true;
      values.startDate = {
        year: startDate.year,
        month: startDate.month + 1,
        day: startDate.day,
      };
      values.endDate = {
        year: endDate.year,
        month: endDate.month + 1,
        day: endDate.day,
      };
      delete values.date;
    } else {
      values.startDate = {
        year: selectedDate.year,
        month: selectedDate.month + 1,
        day: selectedDate.day,
      };
      delete values.date;
    }

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
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item name="name" label="Title" rules={[{ required: true }]} placeholder="Enter event title">
        <Input />
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

      <Form.Item>
        <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
          <span style={{ fontWeight: 500 }}>Date</span>

          <Checkbox
            checked={isMultipleDays}
            onChange={e => {
              setIsMultipleDays(e.target.checked);
              
              // When enabling multiple days, set From to current selected date and Till to next day
              if (e.target.checked) {
                setStartDate(selectedDate);
                
                // Calculate next day
                const nextDay = new Date(selectedDate.year, selectedDate.month, selectedDate.day + 1);
                setEndDate({
                  year: nextDay.getFullYear(),
                  month: nextDay.getMonth(),
                  day: nextDay.getDate(),
                });
              }
            }}
          >
            Multiple days
          </Checkbox>
        </Flex>

        {isMultipleDays ? (
          <Flex gap="middle">

            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 4, color: "#667085" }}>From</div>

              <DatePicker
                date={startDate}
                onChange={setStartDate}
              />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 4, color: "#667085" }}>Till</div>
              
              <DatePicker
                date={endDate}
                onChange={setEndDate}
              />
            </div>

          </Flex>
        ) : (
          <DatePicker
            date={selectedDate}
            onChange={setSelectedDate}
          />
        )}

      </Form.Item>

      <Form.Item name="note" label="Note" placeholder="Enter a note">
        <TextArea />
      </Form.Item>

      <Form.Item name="reminderTime" label="Email Reminder" placeholder="Select reminder time">
        <Select 
          placeholder="Choose when to be reminded"
          options={[
            { value: null, label: "No reminder" },
            { value: "15m", label: "15 minutes before" },
            { value: "1h", label: "1 hour before" },
            { value: "3h", label: "3 hours before" },
            { value: "1d", label: "1 day before" },
            { value: "3d", label: "3 days before" },
            { value: "1w", label: "1 week before" },
          ]}
          allowClear
        />
      </Form.Item>

      <Form.Item name="isRecurring" valuePropName="checked">
        <Checkbox
          checked={selectedDate.year === "unknown" ? true : undefined}
          disabled={selectedDate.year === "unknown"}
        >Repeat every year</Checkbox>
      </Form.Item>

      <Flex gap="small" justify="end">
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
