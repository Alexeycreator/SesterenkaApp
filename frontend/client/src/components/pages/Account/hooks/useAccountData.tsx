import { useState, useEffect } from 'react';

import { getOrderUser, OrderData, Orders, OrderItems } from '../../../servicesApi/OrderApi';
import { AddressOrder } from '../../../servicesApi/AddressesApi';

export const useAccountData = (userLogin?: string) => {
    const [accountData, setAccountData] = useState<OrderData[]>([]);
    const [addressesData, setAddressesData] = useState<AddressOrder[]>([]);
    const [ordersData, setOrdersData] = useState<Orders[]>([]);
    const [orderItemsData, setOrderItemsData] = useState<OrderItems[][]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = async () => {
        if (!userLogin) return;

        try {
            setLoading(true);
            const orders = await getOrderUser(userLogin);
            setAccountData(orders);

            if (orders && orders.length > 0) {
                const allAddresses: AddressOrder[] = [];
                const allOrders: Orders[] = [];
                const allOrderItems: OrderItems[][] = [];

                orders.forEach(ord => {
                    if (ord?.addresses && Array.isArray(ord.addresses)) {
                        allAddresses.push(...ord.addresses);
                    }

                    if (ord?.orders && Array.isArray(ord.orders)) {
                        allOrders.push(...ord.orders);
                    }

                    if (ord?.orders && Array.isArray(ord.orders)) {
                        const items = ord.orders.map(o => o.orderItems);
                        allOrderItems.push(...items);
                    }
                });

                setAddressesData(allAddresses);
                setOrdersData(allOrders);
                setOrderItemsData(allOrderItems);
            }
        } catch (err: any) {
            console.error('Ошибка загрузки данных:', err);
            setError(err.response?.data?.message || 'Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [userLogin]);

    return {
        accountData,
        addressesData,
        ordersData,
        orderItemsData,
        loading,
        error,
        fetchOrders
    };
};