'use client';
import { useEffect, useState } from 'react';
import { Card, Input, Button, message } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { parsePhoneNumberFromString } from 'libphonenumber-js/mobile';
export interface Props {
    onValidChange: (validPhones: string[]) => void;
    onClose: () => void
    value: string[]
}
export default function DynamicInputs({ onValidChange, value }: Props) {
    // [{ id, value, error }, ...]
    const [items, setItems] = useState(() => [{
        id: crypto.randomUUID(), value: "", error: ""
    }])
    const [messageApi, contextHolder] = message.useMessage()
    // 校验单条
    const validate = (val: string): string => {
        if (!val.trim()) return "请输入手机号码"
        const phone = parsePhoneNumberFromString(val, "CN")
        return phone?.isValid() ? "" : "手机号码格式错误"
    }
    // 同步父组件
    const emit = (next: typeof items) => {
        const validPhones = next.filter(i => !i.error && i.value.trim()).map((i => i.value.trim()))
        if (validPhones.length > 5) {
            messageApi.warning("绑定至多5个手机号码")
            return
        }
        onValidChange(validPhones)
    }
    const addInput = () => {
        const next = [...items, { id: crypto.randomUUID(), value: "", error: "" }]
        setItems(next)
        emit(next)
    }
    const removeInput = (id: string) => {
        const next = items.filter(i => i.id !== id)
        setItems(next)
        emit(next)
    }
    const handleChange = (id: string, val: string) => {
        const error = validate(val);
        const next = items.map(i => i.id === id ? { ...i, value: val, error } : i)
        setItems(next)
        emit(next)
    }
    useEffect(() => {
        setItems([])
        const data = value.map((e) =>
            ({ id: crypto.randomUUID(), value: e, error: "" })
        )
        setItems(data)
    }, [])


    return (
        <>
            {contextHolder}
            <Card>
                {items.map(({ id, value, error }) => (
                    <div key={id} className='mb-2'>
                        <div key={id} className="flex items-center gap-2 mb-2">
                            <Input
                                value={value}
                                onChange={e => handleChange(id, e.target.value)}
                                onBlur={e => handleChange(id, e.target.value)}
                                placeholder="请输入手机号"
                                maxLength={11}
                            />
                            {items.length > 1 && (
                                <Button
                                    type="link"
                                    danger
                                    onClick={() => removeInput(id)}
                                >
                                    删除
                                </Button>
                            )}
                        </div>
                        {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
                    </div>
                ))}

                {/* 添加按钮 */}
                <Button
                    type="dashed"
                    icon={<PlusCircleOutlined />}
                    onClick={addInput}
                    className="w-full"
                >
                    新增输入框
                </Button>
            </Card>
        </>

    );
}