import React from 'react';
import { Row, Col, Card, Badge } from 'react-bootstrap';

import { Categories } from '../../../servicesApi/CategoriesApi';

import styles from '../CatalogPage.module.css';

interface CategoriesListProps {
    categoriesData: Categories[];
    onCategorySelect: (categoryId: number) => void;
    getProductCountForCategory: (categoryName: string) => string;
}

export const CategoriesList: React.FC<CategoriesListProps> = ({
    categoriesData,
    onCategorySelect,
    getProductCountForCategory
}) => {
    return (
        <>
            <h2 className={styles.sectionTitle}>Категории товаров</h2>
            <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                {categoriesData.map((category) => (
                    <Col key={category.id}>
                        <Card
                            className={`h-100 ${styles.categoryCard}`}
                            onClick={() => onCategorySelect(category.id)}
                        >
                            <Card.Body className={styles.categoryCardBody}>
                                <div className={styles.categoryIconLarge}>
                                    <span>{category.icon || '📦'}</span>
                                </div>
                                <Card.Title className={styles.categoryTitle}>
                                    {category.name}
                                </Card.Title>
                                <Card.Text className={styles.categoryDescription}>
                                    {category.description}
                                </Card.Text>
                                <div className={styles.categoryFooter}>
                                    <Badge className={styles.productCount}>
                                        {getProductCountForCategory(category.name)}
                                    </Badge>
                                    <span className={styles.categoryLink}>
                                        Просмотреть →
                                    </span>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </>
    );
};