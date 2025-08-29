'use client'
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { deleteQRCodePhones, fetchPhonesByQrcode } from "@/api/qrcode";
import { useEffect, useState } from "react";
import { Button, Card, Empty, Form, Input, message, Modal, Spin, Table, TableProps, Tag } from "antd";
import { bindQRCode } from "@/api/qrcode";
import DynamicInputs from "@/components/DynamicInputs";
// coderltg@gmail.com
// QR-JK77HSELVX
interface QRData {
    code: string
    owner: string
    ownerId: number
    phones: string[]
    qrId: number
}
export type ModalAction = 'create' | 'edit' | 'delete';


export default function BindPage() {
    const { code } = useParams<{ code: string }>()
    const { data: session, status } = useSession()
    const router = useRouter()
    const [qr, setQr] = useState<QRData>()
    const [messageApi, contextHolder] = message.useMessage()
    const [loginBtn, setLoginBtnIsShow] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalTitle, setModalTitle] = useState<ModalAction>()
    const [phones, setPhones] = useState<string[]>([])
    const showModal = async (type: ModalAction) => {
        setModalTitle(type)
        setIsModalOpen(true);
    };
    const tableColumns: TableProps<QRData>['columns'] = [
        {
            title: '二维码编号',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: '归属人',
            dataIndex: 'owner',
            key: 'owner',
        },
        {
            title: '归属人 ID',
            dataIndex: 'ownerId',
            key: 'ownerId',
        },
        {
            title: '二维码 ID',
            dataIndex: 'qrId',
            key: 'qrId',
        },
        {
            title: '已绑定手机号',
            dataIndex: 'phones',
            key: 'phones',
            render: (phones: string[]) =>
                Array.isArray(phones) && phones.length
                    ? phones.map(p => <Tag key={p}>{p}</Tag>)
                    : '暂无绑定',
        },
        {
            key: "actions",
            title: "操作",
            render: (_, record, index) => (
                <div>
                    {/* <Button type="link" onClick={handleEditModal()}>编辑 </Button>
                <Button type="link" danger onClick={handleEditModal()}>删除 </Button> */}
                    <Button type="link" key={`edit-${record}-${index}`} onClick={() => handleEditModal()}>编辑 </Button>
                    <Button type="link" danger key={`del-${record}-${index}`} onClick={() => handleDelete()}>删除 </Button>
                </div>
            )
        }
    ]
    const handleOk = async () => {
        // 校验是否存在重复电话号码
        const uniquePhones = [...new Set(phones.map(p => p.trim()))]
        if (uniquePhones.length !== phones.length) {
            messageApi.error("请勿保存重复手机号码")
            return
        }
        const res = await bindQRCode(code, { ownerId: session?.user.id!, phones })
        console.log("res", res)
        await loadData()
        console.log(phones);

        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setPhones([])
    };
    const handleEditModal = () => {
        setModalTitle("edit")
        setIsModalOpen(true);
    }
    const handleDelete = () => {
        setModalTitle("delete")
        setIsModalOpen(true);
    }
    // 获取qr数据
    const loadData = async () => {
        try {
            const res = await fetchPhonesByQrcode(code as string)
            setQr(res.data)
        } catch (error: any) {
            console.log("获二维码信息失败:", error)
            if (error && error.data && error.data.message) {
                messageApi.error(error.data.message)
                if ((error.data.message as string).includes("未绑定")) {
                    setLoginBtnIsShow(true)
                }
            }
        }
    }
    useEffect(() => {
        if (isModalOpen && qr?.phones) {
            setPhones(qr.phones);
        }
    }, [isModalOpen, modalTitle, qr]);
    useEffect(() => {
        setQr(undefined)
        console.log(qr)
        if (status !== 'authenticated') {
            loadData()
        }
    }, [code, status])



    // 1. loading 态：防止 hydration 抖动
    if (status !== 'authenticated') return <Spin percent={"auto"} fullscreen ></Spin>

    // 2. 未登录
    if (!session?.user) return <p>请重新扫码登录</p>

    // 3. 无二维码
    if (!code) return <p>二维码无效</p>

    return (
        <div className="w-full min-h-screen flex items-center justify-center">
            {contextHolder}
            {loginBtn && (
                <div className="w-full max-w-sm px-4">   {/* 限制最大宽度，手机也好看 */}
                    <Card title="跳转信息" variant="borderless">
                        <p>该二维码未绑定用户信息，请重新扫描二维码登录</p>
                        <Button
                            type="primary"
                            onClick={() => router.replace(`/login?code=${code}`)}
                        >
                            跳转登录页
                        </Button>
                    </Card>
                </div>
            )}
            {!loginBtn && (
                <div className="bg-gray-500 w-screen min-h-screen flex items-center justify-center">
                    <div className="w-full max-w-screen-xl lg:max-w-screen-3xl h-full px-4">   {/* 桌面三栏宽，手机自适应 */}
                        <Card title={`用户已绑定二维码：${code}`} variant="borderless" style={{ height: '100%' }}>
                            {/* Operation Button */}
                            <div className="flex gap-4">
                                <Button type="primary" onClick={() => { showModal("create") }}>新增</Button>

                            </div>
                            <Table
                                dataSource={qr ? [qr] : []}
                                rowKey={'qrId'}
                                columns={tableColumns}
                                locale={{ emptyText: <Empty description="暂无数据" /> }}
                                className="w-full"
                            />
                        </Card>
                    </div>
                </div>
            )}
            <Modal
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="保存"
                cancelText="取消"
                destroyOnHidden
            >
                {
                    (modalTitle === "create") && (
                        <Card title={`批量绑定手机号`}>
                            <DynamicInputs onValidChange={setPhones} onClose={handleCancel} value={phones}></DynamicInputs>
                        </Card>
                    )

                }
                {(modalTitle === "delete") && (
                    <Card title={`批量删除手机号`}>
                        <DynamicInputs onValidChange={setPhones} onClose={handleCancel} value={phones}></DynamicInputs>
                    </Card>
                )}
                {(modalTitle === "edit") && (
                    <Card title={`批量编辑手机号`}>
                        <DynamicInputs onValidChange={setPhones} onClose={handleCancel} value={phones}></DynamicInputs>
                    </Card>
                )}
            </Modal>
        </div>

    );
}
