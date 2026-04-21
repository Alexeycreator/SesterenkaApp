import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { getStocks, Stock } from '../../../../servicesApi/StocksApi';
import { getProducts, Product } from '../../../../servicesApi/ProductsApi';
import styles from '../AdminPanel.module.css';

// Моковые данные для складов
interface Warehouse {
    id: number;
    name: string;
    address: string;
}

const mockWarehouses: Warehouse[] = [
    { id: 1, name: 'Центральный склад', address: 'Москва, ул. Пальмовая, 13' },
    { id: 2, name: 'Склад Санкт-Петербург', address: 'СПб, ул. Автомобильная, 45' },
    { id: 3, name: 'Склад Казань', address: 'Казань, пр. Ямашева, 88' },
];

interface StockManagementProps {
    show: boolean;
    onHide: () => void;
    onRefresh?: () => void;
}

export const StockManagement: React.FC<StockManagementProps> = ({ show, onHide, onRefresh }) => {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [warehouses] = useState<Warehouse[]>(mockWarehouses);
    const [loading, setLoading] = useState(false);
    const [editingStock, setEditingStock] = useState<Stock | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        products_Id: 0,
        warehouses_Id: 0,
        quantity: 0
    });

    useEffect(() => {
        if (show) {
            loadData();
        }
    }, [show]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [stocksData, productsData] = await Promise.all([
                getStocks(),
                getProducts()
            ]);
            setStocks(stocksData);
            setProducts(productsData);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStocks = useMemo(() => {
        if (!searchTerm.trim()) return stocks;
        const term = searchTerm.toLowerCase().trim();
        return stocks.filter(stock => {
            const product = products.find(p => p.id === stock.products_Id);
            const warehouse = warehouses.find(w => w.id === stock.warehouses_Id);
            return (product?.name.toLowerCase().includes(term)) ||
                (product?.partNumber?.toLowerCase().includes(term)) ||
                (warehouse?.name.toLowerCase().includes(term));
        });
    }, [stocks, products, warehouses, searchTerm]);

    const handleSave = async () => {
        if (!formData.products_Id || !formData.warehouses_Id || formData.quantity < 0) {
            alert('Заполните все поля');
            return;
        }

        try {
            if (editingStock) {
                //await updateStock(editingStock.id, formData.quantity);
                alert('Остатки обновлены');
            } else {
                //await createStock(formData);
                alert('Остатки добавлены');
            }
            resetForm();
            await loadData();
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Не удалось сохранить остатки');
        }
    };

    const resetForm = () => {
        setFormData({ products_Id: 0, warehouses_Id: 0, quantity: 0 });
        setEditingStock(null);
    };

    const handleEdit = (stock: Stock) => {
        setEditingStock(stock);
        // setFormData({
        //     products_Id: stock.products_Id,
        //     warehouses_Id: stock.warehouses_Id,
        //     quantity: stock.quantity
        // });
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Удалить запись об остатках?')) {
            try {
                //await deleteStock(id);
                alert('Запись удалена');
                await loadData();
                if (onRefresh) onRefresh();
            } catch (error) {
                console.error('Ошибка удаления:', error);
                alert('Не удалось удалить запись');
            }
        }
    };

    const getProductName = (productId: number) => {
        const product = products.find(p => p.id === productId);
        return product?.name || `Товар #${productId}`;
    };

    const getWarehouseName = (warehouseId: number) => {
        const warehouse = warehouses.find(w => w.id === warehouseId);
        return warehouse?.name || `Склад #${warehouseId}`;
    };

    const clearSearch = () => setSearchTerm('');

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Управление остатками на складах</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={6}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5>Текущие остатки</h5>
                            <Button size="sm" variant="outline-primary" onClick={loadData} disabled={loading}>
                                🔄 Обновить
                            </Button>
                        </div>

                        <InputGroup className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="🔍 Поиск по товару или складу..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && <Button variant="outline-secondary" onClick={clearSearch}>✕</Button>}
                        </InputGroup>

                        <div className={styles.itemsList}>
                            {loading ? (
                                <p className="text-center">Загрузка...</p>
                            ) : filteredStocks.length === 0 ? (
                                <p className="text-center text-muted">
                                    {searchTerm ? 'Остатки не найдены' : 'Нет данных об остатках'}
                                </p>
                            ) : (
                                <>
                                    <div className={styles.searchInfo}>Найдено: {filteredStocks.length} из {stocks.length}</div>
                                    {filteredStocks.map(stock => (
                                        <div key={stock.id} className={styles.listItem}>
                                            <div className={styles.itemInfo}>
                                                {/* <strong>{getProductName(stock.products_Id)}</strong>
                                                <span>Склад: {getWarehouseName(stock.warehouses_Id)}</span> */}
                                                <span>Кол-во: {stock.quantity} шт.</span>
                                            </div>
                                            <div className={styles.itemActions}>
                                                <Button size="sm" className={styles.editBtn} onClick={() => handleEdit(stock)}>✎</Button>
                                                <Button size="sm" className={styles.deleteBtn} onClick={() => handleDelete(stock.id)}>✕</Button>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </Col>
                    <Col md={6}>
                        <h5>{editingStock ? 'Редактирование остатков' : 'Добавление остатков'}</h5>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Товар *</Form.Label>
                                <Form.Select
                                    value={formData.products_Id}
                                    onChange={(e) => setFormData({ ...formData, products_Id: Number(e.target.value) })}
                                    disabled={!!editingStock}
                                >
                                    <option value={0}>Выберите товар</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.partNumber})</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Склад *</Form.Label>
                                <Form.Select
                                    value={formData.warehouses_Id}
                                    onChange={(e) => setFormData({ ...formData, warehouses_Id: Number(e.target.value) })}
                                    disabled={!!editingStock}
                                >
                                    <option value={0}>Выберите склад</option>
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Количество *</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                    placeholder="Введите количество"
                                    min="0"
                                />
                            </Form.Group>
                        </Form>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Закрыть</Button>
                {editingStock ? (
                    <Button className={styles.saveBtn} onClick={handleSave}>Сохранить изменения</Button>
                ) : (
                    <Button className={styles.saveBtn} onClick={handleSave}>Добавить остатки</Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};