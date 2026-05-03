import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';

import { createStock, deleteStock, getManagementStocks, updateStock } from '../../../../servicesApi/StocksApi';

import styles from '../AdminPanel.module.css';

interface StockManagementProps {
    show: boolean;
    onHide: () => void;
    onRefresh?: () => void;
}

export const StockManagement: React.FC<StockManagementProps> = ({ show, onHide, onRefresh }) => {
    const [stockData, setStockData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingStock, setEditingStock] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        productId: 0,
        warehouseId: 0,
        quantity: 0
    });

    useEffect(() => {
        if (show) {
            loadData();
        } else {
            resetAllStates();
        }
    }, [show]);

    const resetAllStates = () => {
        setFormData({ productId: 0, warehouseId: 0, quantity: 0 });
        setEditingStock(null);
        setSearchTerm('');
        setStockData(null);
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getManagementStocks();

            let extractedData;
            if (Array.isArray(data) && data.length > 0) {
                extractedData = data[0];
            } else {
                extractedData = data;
            }

            setStockData(extractedData);
        } catch (error: any) {
            console.error('Ошибка загрузки данных:', error);
            alert(error.serverMessage || 'Не удалось загрузить данные об остатках');
        } finally {
            setLoading(false);
        }
    };

    const enrichedStocks = useMemo(() => {
        if (!stockData?.stocks || !stockData?.products || !stockData?.warehouses) {
            return [];
        }

        const result = stockData.stocks.map((stock: any) => {
            const product = stockData.products?.find((p: any) => p.id === stock.products_Id);
            const warehouse = stockData.warehouses?.find((w: any) => w.id === stock.warehouses_Id);

            return {
                id: stock.id,
                quantity: stock.quantity,
                productId: stock.products_Id,
                productName: product?.nameProduct || `Товар #${stock.products_Id}`,
                productPartNumber: product?.partNumber || '',
                warehouseName: warehouse?.name || 'Склад не указан',
                warehouseId: stock.warehouses_Id
            };
        });
        return result;
    }, [stockData]);

    const filteredStocks = useMemo(() => {
        if (!searchTerm.trim()) return enrichedStocks;
        const term = searchTerm.toLowerCase().trim();
        return enrichedStocks.filter((stock: any) =>
            stock.productName?.toLowerCase().includes(term) ||
            stock.productPartNumber?.toLowerCase().includes(term) ||
            stock.warehouseName?.toLowerCase().includes(term)
        );
    }, [enrichedStocks, searchTerm]);

    const handleSave = async () => {
        if (!formData.productId || !formData.warehouseId || formData.quantity < 0) {
            alert('Заполните все поля');
            return;
        }

        setSaving(true);
        try {
            if (editingStock) {
                await updateStock(editingStock.id, formData.quantity);
                alert('Остатки успешно обновлены');
            } else {
                await createStock({
                    products_Id: formData.productId,
                    warehouses_Id: formData.warehouseId,
                    quantity: formData.quantity
                });
                alert('Остатки успешно добавлены');
            }
            resetForm();
            await loadData();
            if (onRefresh) onRefresh();
        } catch (error: any) {
            console.error('Ошибка сохранения:', error);
            if (error.serverMessage) {
                alert(error.serverMessage);
            } else if (error.message) {
                alert(error.message);
            } else {
                alert('Не удалось сохранить остатки');
            }
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({ productId: 0, warehouseId: 0, quantity: 0 });
        setEditingStock(null);
    };

    const clearForm = () => {
        setFormData({ productId: 0, warehouseId: 0, quantity: 0 });
        if (editingStock) {
            setEditingStock(null);
        }
    };

    const handleEdit = (stock: any) => {
        setEditingStock(stock);
        setFormData({
            productId: stock.productId,
            warehouseId: stock.warehouseId,
            quantity: stock.quantity
        });
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Удалить запись об остатках?')) {
            setSaving(true);
            try {
                await deleteStock(id);
                alert('Запись успешно удалена');
                await loadData();
                if (onRefresh) onRefresh();
            } catch (error: any) {
                console.error('Ошибка удаления:', error);
                if (error.serverMessage) {
                    alert(error.serverMessage);
                } else if (error.message) {
                    alert(error.message);
                } else {
                    alert('Не удалось удалить запись');
                }
            } finally {
                setSaving(false);
            }
        }
    };

    const clearSearch = () => setSearchTerm('');

    const handleClose = () => {
        resetAllStates();
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
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
                                    <div className={styles.searchInfo}>
                                        Найдено: {filteredStocks.length} из {enrichedStocks.length}
                                    </div>
                                    {filteredStocks.map((stock: any) => (
                                        <div key={stock.id} className={styles.listItem}>
                                            <div className={styles.itemInfo}>
                                                <strong className={styles.productName}>{stock.productName}</strong>
                                                {stock.productPartNumber && (
                                                    <span className={styles.itemArticle}>Арт: {stock.productPartNumber}</span>
                                                )}
                                                <span className={styles.itemWarehouse}>Склад: {stock.warehouseName}</span>
                                                <span className={styles.itemQuantity}>Кол-во: {stock.quantity} шт.</span>
                                            </div>
                                            <div className={styles.itemActions}>
                                                <Button size="sm" className={styles.editBtn} onClick={() => handleEdit(stock)} disabled={saving}>✎</Button>
                                                <Button size="sm" className={styles.deleteBtn} onClick={() => handleDelete(stock.id)} disabled={saving}>✕</Button>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5>{editingStock ? 'Редактирование остатков' : 'Добавление остатков'}</h5>
                            {!editingStock && (
                                <Button size="sm" variant="outline-secondary" onClick={clearForm} disabled={saving}>
                                    🗑️ Очистить
                                </Button>
                            )}
                        </div>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Товар *</Form.Label>
                                <Form.Select
                                    value={formData.productId}
                                    onChange={(e) => setFormData({ ...formData, productId: Number(e.target.value) })}
                                    disabled={!!editingStock || saving}
                                >
                                    <option value={0}>Выберите товар</option>
                                    {stockData?.products?.map((product: any) => (
                                        <option key={product.id} value={product.id}>
                                            {product.nameProduct} {product.partNumber ? `(${product.partNumber})` : ''}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Склад *</Form.Label>
                                <Form.Select
                                    value={formData.warehouseId}
                                    onChange={(e) => setFormData({ ...formData, warehouseId: Number(e.target.value) })}
                                    disabled={!!editingStock || saving}
                                >
                                    <option value={0}>Выберите склад</option>
                                    {stockData?.warehouses?.map((warehouse: any) => (
                                        <option key={warehouse.id} value={warehouse.id}>
                                            {warehouse.name} ({warehouse.type})
                                        </option>
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
                                    disabled={saving}
                                />
                            </Form.Group>
                            <div className="d-flex gap-2 mt-3">
                                {!editingStock && (
                                    <Button variant="secondary" onClick={clearForm} className="flex-grow-1" disabled={saving}>
                                        🗑️ Очистить форму
                                    </Button>
                                )}
                                <Button
                                    className={styles.saveBtn}
                                    onClick={handleSave}
                                    disabled={saving || !formData.productId || !formData.warehouseId}
                                    style={{ flex: editingStock ? 1 : 2 }}
                                >
                                    {saving ? 'Сохранение...' : (editingStock ? 'Сохранить изменения' : '➕ Добавить остатки')}
                                </Button>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={saving}>Закрыть</Button>
            </Modal.Footer>
        </Modal>
    );
};