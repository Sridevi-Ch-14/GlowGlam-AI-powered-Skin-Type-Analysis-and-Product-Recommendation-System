import sys
import json
import os

class ProductRecommender:
    def __init__(self):
        # Load product database
        data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'skin_products.json')
        try:
            with open(data_path, 'r', encoding='utf-8') as f:
                self.product_database = json.load(f)
        except FileNotFoundError:
            print(json.dumps({'error': 'Product database not found'}), file=sys.stderr)
            self.product_database = {}
        except json.JSONDecodeError as e:
            print(json.dumps({'error': f'Invalid product database: {str(e)}'}), file=sys.stderr)
            self.product_database = {}
    
    def get_recommendations(self, skin_type, conditions=None):
        """
        Get product recommendations based on skin type and conditions.
        
        Args:
            skin_type: Detected skin type (Oily, Dry, Normal, Combination, Sensitive, Acne)
            conditions: List of skin conditions (optional)
        
        Returns:
            Dictionary with recommended products
        """
        if not skin_type:
            return {
                'recommended_products': [],
                'skin_type': 'Unknown',
                'total_products': 0,
                'error': 'Skin type not provided'
            }
        
        # Normalize skin type - capitalize first letter
        skin_type_normalized = skin_type.strip().capitalize()
        
        # Map variations to standard keys
        skin_type_map = {
            'Acne': 'Acne',
            'Oily': 'Oily',
            'Dry': 'Dry',
            'Normal': 'Normal',
            'Combination': 'Combination',
            'Sensitive': 'Sensitive'
        }
        
        # Get the correct key
        skin_type_key = skin_type_map.get(skin_type_normalized, skin_type_normalized)
        
        # Get products for this skin type
        products = self.product_database.get(skin_type_key, [])
        
        # If no products found, return error
        if not products:
            return {
                'recommended_products': [],
                'skin_type': skin_type_normalized,
                'total_products': 0,
                'error': f'No products found for skin type: {skin_type_key}'
            }
        
        # Filter products based on conditions if provided
        if conditions and len(conditions) > 0:
            filtered_products = []
            condition_keywords = []
            
            # Extract keywords from conditions
            for condition in conditions:
                if isinstance(condition, dict):
                    condition_name = condition.get('name', '').lower()
                else:
                    condition_name = str(condition).lower()
                
                condition_keywords.append(condition_name)
            
            # Filter products that match conditions
            for product in products:
                product_desc = product.get('description', '').lower()
                product_name = product.get('name', '').lower()
                product_category = product.get('category', '').lower()
                
                # Check if product matches any condition
                matches = False
                for keyword in condition_keywords:
                    if (keyword in product_desc or 
                        keyword in product_name or 
                        keyword in product_category):
                        matches = True
                        break
                
                # If no specific condition match, include all products for the skin type
                if not condition_keywords or matches:
                    filtered_products.append(product)
            
            # If filtering removed all products, use original list
            if filtered_products:
                products = filtered_products
        
        # Limit to top 5-6 products for better UX
        products = products[:6]
        
        # Add additional metadata
        for product in products:
            # Ensure all required fields are present
            if 'reviews_score' not in product:
                product['reviews_score'] = product.get('rating', 4.0)
            
            # Format price if needed
            if isinstance(product.get('price'), str):
                try:
                    product['price'] = int(float(product['price']))
                except:
                    product['price'] = 0
        
        return {
            'recommended_products': products,
            'skin_type': skin_type_normalized,
            'total_products': len(products),
            'conditions': conditions or []
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Skin type required'}))
        sys.exit(1)
    
    skin_type = sys.argv[1]
    conditions = json.loads(sys.argv[2]) if len(sys.argv) > 2 else []
    
    recommender = ProductRecommender()
    result = recommender.get_recommendations(skin_type, conditions)
    print(json.dumps(result, ensure_ascii=False))
