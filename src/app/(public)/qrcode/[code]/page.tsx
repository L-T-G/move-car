'use client';
// 二维码页面
/**
 * function:此页面主要功能为展示二维码绑定信息
 * permission：everyone
 * */
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Form, Input, Button, message, Spin } from 'antd';
import { fetchQRCodeDetail, bindQRCode } from '@/api/qrcode';

interface QRCodeDetail {
  id: number;
  code: string;
  status: 'available' | 'bound' | 'disabled';
  owner?: {
    id: number;
    name: string;
    phones: { number: string }[];
  };
}
interface BindPhone {
  phone: string
  smsCode: string
}

export default function QRCodePage() {
  const params = useParams<{ code: string }>()
  const [loading, setLoading] = useState(true)
  const [qrDetail, setQrDetail] = useState<QRCodeDetail | null>(null)
  const loadDetail = async () => {
    try {
      const res = await fetchQRCodeDetail(params.code)
      console.log(res)
      setQrDetail(res.data)
    } catch (error) {
      console.log('二维码信息获取失败：', error);
    } finally {
      setLoading(false);
    }
  }
  const onLoginFinish = async (values: BindPhone) => {
    try {
      await bindQRCode({
        code: params.code,
        phone: values.phone,
        smsCode: values.smsCode,
      });
      message.success('绑定成功');
      loadDetail();
    } catch (error) {
      console.log('绑定失败', error);
    }
  };
  useEffect(() => {
    loadDetail();
  }, [params.code]);


  if (loading) return <Spin fullscreen />;
  if (!qrDetail) return <h1>二维码不存在</h1>;
  if (qrDetail.status === 'bound') {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">车辆绑定信息</h1>
        <p className="mb-2">您可以点击手机号直接拨打电话：</p>
        <ul className="space-y-2">
          {qrDetail.owner?.phones.map((p: { number: string }, i: number) => (
            <li key={i}>
              <a
                href={`tel:${p.number}`}
                className="block px-4 py-3 rounded-xl bg-blue-500 text-white text-center text-lg shadow active:bg-blue-600"
              >
                拨打：{p.number}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // 未绑定 → 登录绑定
  if (qrDetail.status === 'available') {
    return (
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">绑定车辆信息</h1>
        <Form layout="vertical" onFinish={onLoginFinish}>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input placeholder="请输入手机号" inputMode="numeric" />
          </Form.Item>
          <Form.Item
            name="smsCode"
            label="短信验证码"
            rules={[{ required: true, message: '请输入验证码' }]}
          >
            <Input placeholder="请输入验证码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              登录并绑定
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
  // 禁用
  return (
    <div className="p-4 text-center text-gray-500">
      <h1 className="text-xl font-bold">二维码已禁用</h1>
    </div>
  );
}
