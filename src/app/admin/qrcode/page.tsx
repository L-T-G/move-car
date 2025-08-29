// 管理二维码
/**
 * function:此页面主要功能为二维码的信息查询、增加、删除（高危）、修改
 * permission：admin
 * */
'use client'
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from "react"
import { Button, Card, Form, Input, Table, Tag, Progress, notification, Select, Modal } from "antd";
import type { TableProps } from "antd";
import { Pagination, QRCode, QRCodeFilterParams, UpdateQRCodePayload } from "@/libs/types";
import { fetchQRCodeList, updateQRCode } from "@/api/qrcode";
import QRCodeThumbnail from "@/components/QRCodeThumbnail";
import { AdminGuard } from "@/components/AdminGuard";


export interface QrList {
    code: string
    status: string
    ownerName: string
    createdAt: string
    updatedAt: string
    phones: Array<string>
}

export default function QRCodeAdminPage() {
    const router = useRouter();
    const [form] = Form.useForm();
    const [qrList, setQrList] = useState<QRCode[]>()
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [progress, setProgress] = useState({ completed: 0, total: 0 })
    const sseRef = useRef<EventSource | null>(null)
    // notification 
    const [api, contextHolder] = notification.useNotification()
    const [taskStatus, setTaskStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
    // 编辑弹窗
    const [editVisible, setEditVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState<QRCode | null>(null);
    const [editForm] = Form.useForm();
    // SSE请求
    const startSSE = (count: number) => {
        if (sseRef.current) sseRef.current.close()
        const es = new EventSource(`/api/qrcode/generate?count=${count}`)
        sseRef.current = es
        setProgress({ completed: 0, total: count })
        setTaskStatus('running') // 标记任务开始
        es.addEventListener("progress", (e: MessageEvent) => {
            const data = JSON.parse(e.data)
            setProgress(prev => ({ ...prev, completed: data.completed }));

        })
        es.addEventListener("done", () => {
            setProgress(prev => ({ ...prev, completed: prev.total }));
            setTaskStatus('done')  // 标记任务完成
            es.close();
            // 可选择刷新表格或批量加入成功二维码 比如在右上方悬浮框加上完成后刷新
        })
        es.addEventListener("error", () => {
            setTaskStatus('error')
            setProgress({ completed: 0, total: 0 })
            es.close();
        })
    }
    const tableColumns: TableProps<QRCode>['columns'] = [
        {
            key: "thumbnail",
            title: "二维码",
            width: 100,
            render: (_, record) => <QRCodeThumbnail qrcode={record} size={64} />
        },
        {
            key: "code",
            title: "二维码序号",
            dataIndex: "code",
            render: (code: string) => <span className="font-mono">{code}</span>
        },
        {
            key: "status",
            title: "状态",
            dataIndex: "status",
            render: (status: string) => (
                <Tag
                    color={
                        status === "available" ? "green" :
                            status === "bound" ? "blue" : "orange"
                    }
                >
                    {status.toUpperCase()}
                </Tag>
            )
        },
        {
            key: "ownerName",
            title: "所有者",
            render: (_, record) => record.owner?.name || "未分配"
        },
        {
            key: "createdAt",
            title: "创建时间",
            dataIndex: "createdAt",
            render: (date: string) => new Date(date).toLocaleString()
        },
        {
            key: "updatedAt",
            title: "更新时间",
            dataIndex: "updatedAt", // 注意接口字段名为 updatedAt
            render: (date: string | null) =>
                date ? new Date(date).toLocaleString() : "-"
        },
        {
            key: "phones",
            title: "电话号码",
            render: (_, record) => {
                const phones = record.owner?.phones || [];

                if (phones.length === 0) {
                    return <span className="text-gray-400">无号码</span>;
                }

                return (
                    <div className="flex flex-wrap gap-1">
                        {phones.map((phone, index) => (
                            <Tag
                                key={`${record.id}-${index}`}
                                className="hover:shadow cursor-pointer"
                            >
                                {phone.number}
                            </Tag>
                        ))}
                    </div>
                );
            }
        },
        // 修改 tableColumns 里的 actions
        {
            key: "actions",
            title: "操作",
            render: (_, record) => (
                <div>
                    <a
                        className="mr-2"
                        onClick={() => {
                            if (record.status === "available") {
                                // 跳转绑定主人页面
                                router.push(`/qrcode/${encodeURIComponent(record.code)}`);
                                return;
                            }
                            if (record.status === "disabled") {
                                notification.warning({
                                    message: "禁止修改",
                                    description: "禁用状态的二维码不能修改",
                                });
                                return;
                            }
                            // bound 状态才进入编辑弹窗
                            setEditingRecord(record);
                            editForm.setFieldsValue({
                                id: record.id,
                                status: record.status,
                                phones: record.owner?.phones?.map(p => p.number) || []
                            });
                            setEditVisible(true);
                        }}
                    >编辑</a>
                </div>
            )
        }

    ];
    // 加载数据
    const loadData = async (page = 1, pageSize = 10, filters: QRCodeFilterParams = {}) => {
        try {
            const res = await fetchQRCodeList(page, pageSize, filters);
            setQrList(res.data);
            setPagination(res.pagination);
        } catch (error) {
            console.log("加载二维码失败:", error);
        }
    };
    useEffect(() => {
        loadData()
        return () => {
            sseRef.current?.close()
        }
    }, [])
    // 监听 taskStatus 并在副作用中触发通知
    // 显示通知
    useEffect(() => {
        if (taskStatus === 'running') {
            api.info({
                message: "任务开始",
                description: `正在生成 ${progress.total} 个二维码...`,
                placement: "topRight",
            });
        } else if (taskStatus === 'done') {
            api.success({
                message: "任务完成",
                description: "二维码生成成功，请刷新查看。",
                placement: "topRight",
            });
            setTaskStatus('idle');
        } else if (taskStatus === 'error') {
            api.error({
                message: "任务失败",
                description: "二维码生成过程中出错，已回滚！",
                placement: "topRight",
            });
            setTaskStatus('idle');
        }
    }, [taskStatus, api, progress.total]);
    return (
        <AdminGuard>
            <div className="flex flex-col justify-start md:items-start">
                {/* Header */}
                {/* <h2 className="block w-full text-xl font-bold px-4 py-4 hover:shadow" >二维码管理</h2> */}
                {/* Content Card*/}
                {contextHolder}
                <Card title="二维码管理" variant="borderless" className="w-full">
                    {/* Operation */}
                    <Form form={form} name="qr-query" className="flex flex-row w-full gap-3 mb-4" onFinish={((values) => {
                        loadData(1, 10, values)
                    })}>
                        <Form.Item name="phone">
                            <Input placeholder="输入电话号码" />
                        </Form.Item>
                        <Form.Item name="code">
                            <Input placeholder="输入二维码序号" />
                        </Form.Item>
                        <Form.Item name="status">
                            <Select placeholder="选择状态" style={{ width: 120 }}>
                                <Select.Option value="available">可用</Select.Option>
                                <Select.Option value="bound">已使用</Select.Option>
                                <Select.Option value="disabled">禁用</Select.Option>
                            </Select>
                        </Form.Item>
                        <Button type="primary" htmlType="submit">查询</Button>
                        <Button type="primary" onClick={() => startSSE(10)}>新增</Button>
                        <Button danger>删除</Button>
                        <Button type="primary"
                            onClick={() => { }}
                        >
                            导出可用二维码
                        </Button>
                    </Form>
                    {/* Qrlist Table */}
                    <Table<QRCode>
                        columns={tableColumns}
                        dataSource={qrList}
                        pagination={{
                            current: pagination?.page,
                            pageSize: pagination?.pageSize,
                            total: pagination?.total,
                            showSizeChanger: true,
                            pageSizeOptions: [10, 20, 50],
                            showTotal: (total) => `共 ${total} 条记录`,
                            onChange: (page, pageSize) => {
                                loadData(page, pageSize, form.getFieldsValue())
                            }
                        }}
                        rowKey="code"
                        bordered
                    />
                </Card >
                {/* 右上角悬浮进度条 */}
                {progress.total > 0 && progress.completed < progress.total && (
                    <div style={{
                        position: 'fixed',
                        top: 6,
                        right: 16,
                        width: 200,
                        padding: 12,
                        backgroundColor: 'white',
                        boxShadow: '0 0 8px rgba(0,0,0,0.15)',
                        borderRadius: 8,
                        zIndex: 1000
                    }}>
                        <div className="mb-1 font-medium">生成进度</div>
                        <Progress type="circle" steps={{ count: 5, gap: 8 }}
                            trailColor="rgba(0, 0, 0, 0.06)"
                            strokeWidth={20} percent={Math.round((progress.completed / progress.total) * 100)} />
                        <div className="text-sm mt-1">{progress.completed}/{progress.total}</div>
                    </div>
                )}
                {/* 编辑弹窗 */}
                <Modal
                    title="编辑二维码信息"
                    open={editVisible}
                    onCancel={() => setEditVisible(false)}
                    onOk={async () => {
                        try {
                            const values = await editForm.validateFields();
                            if (editingRecord) {
                                if (editingRecord) {
                                    // 格式化请求数据
                                    const payload: UpdateQRCodePayload = {
                                        status: values.status,
                                    };
                                    if (values.phones && values.phones.length > 0) {
                                        payload.phones = values.phones.filter((p: string) => !!p);; // 服务器期望 phones: string[]
                                    }
                                    await updateQRCode(editingRecord.id, payload);
                                    notification.success({ message: "修改成功" });
                                    setEditVisible(false);
                                    loadData(pagination?.page || 1, pagination?.pageSize || 10, form.getFieldsValue());
                                }


                            }
                        } catch (err) {
                            console.error(err);
                        }
                    }}
                >
                    <Form form={editForm} layout="vertical">
                        <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                            <Select>
                                <Select.Option value="available">可用</Select.Option>
                                <Select.Option value="bound">已使用</Select.Option>
                                <Select.Option value="disabled">禁用</Select.Option>
                            </Select>
                        </Form.Item>
                        {/* 多手机号编辑 */}
                        <Form.List name="phones">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Form.Item
                                            key={key}
                                            {...restField}
                                            name={name}
                                            label={`手机号 ${name + 1}`}
                                            rules={[{ required: true, message: "请输入手机号" }]}
                                        >
                                            <Input
                                                addonAfter={
                                                    <Button type="dashed" danger onClick={() => remove(name)}>删除</Button>
                                                }
                                            />
                                        </Form.Item>
                                    ))}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()}>
                                            添加手机号
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List >
                    </Form>
                </Modal>
            </div >
        </AdminGuard>

    );
}