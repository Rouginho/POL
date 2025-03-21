import React, { useState, useContext } from 'react';
import { View,ImageBackground, Text, Image, FlatList, StyleSheet, TouchableOpacity, Animated, Easing , TextInput, Modal, Button, Alert, ScrollView,ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';





const BestProducts = [
  {
      id: '1',
      name: 'ΓΑΛΑ',
      price: 2.5,
      time: 'ΤΕΤΑΡΤΗ 15/3',
      ekptwsh: '40%',
      kathgoria: 'Γαλακτομικά',
      arxikh: 5.50,
      brand: 'AVA',
      image: require('./assets/gg.jpg')
  },
  {
      id: '2',
      name: 'ΨΩΜΙ',
      price: 1.2,
      time: 'ΠΕΜΠΤΗ 17/3',
      ekptwsh: '60%',
      kathgoria: 'Απορρυπαντικά',
      arxikh: 5.50,
      brand: 'vileda',
      image: require('./assets/gg.jpg')
  },
  {
      id: '3',
      name: 'ΤΥΡΙ',
      price: 4.8,
      time: 'ΔΕΥΤΕΡΑ 19/3',
      ekptwsh: '40%',
      kathgoria: 'Γαλακτομικά',
      arxikh: 5.50,
      brand: 'AVA',
      image: require('./assets/gg.jpg')
  }
];
const sklaprods = [
  { id: '4', name: 'ΝΤΟΜΑΤΑ', price: 2.5,time:'ΤΕΤΑΡΤΗ', image: require('./assets/gg.jpg') },
  { id: '5', name: 'ΚΡΕΑΣ', price: 1.2,time:'ΤΕΤΑΡΤΗ', image: require('./assets/gg.jpg') },
  { id: '6', name: 'ΔΗΜΗΤΡΙΑΚΑ', price: 4.8,time:'ΤΕΤΑΡΤΗ', image: require('./assets/gg.jpg') },
  // Προσθέστε τα υπόλοιπα προϊόντα
];
const CartContext = React.createContext();

// CartProvider component
function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = (item) => {
    setCartItems((prevCart) => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prevCart) => {
      return prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
      ).filter(item => item.quantity > 0);
    });
  };

  const deleteFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  return (
    <CartContext.Provider value={{ cartItems, isOpen, setIsOpen, addToCart, removeFromCart, deleteFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

function CartButton() {
  const { cartItems, isOpen, setIsOpen, addToCart, removeFromCart, deleteFromCart } = useContext(CartContext);
  const [isOrderModalVisible, setOrderModalVisible] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [thl, setThl] = useState('');
  const [perioxh, setPerioxh] = useState('');
  const [diefthinsi, setDiefthinsi] = useState('');
  const [koudouni, setKoudouni] = useState('');
  const [sxolia, setSxolia] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const arxikoPrice = cartItems.reduce((total, item) => total + item.arxikh * item.quantity, 0);
  const handleOrderSubmit = async () => {
    // Έλεγχος για υποχρεωτικά πεδία
    if (!firstName || !lastName || !thl || !perioxh || !diefthinsi) {
      Alert.alert('Σφάλμα', 'Συμπληρώστε όλα τα απαιτούμενα πεδία!');
      return;
    }
  
    // Δεδομένα παραγγελίας
    const orderData = {
      firstName,
      lastName,
      thl,
      perioxh,
      diefthinsi,
      koudouni,
      sxolia,
      cartItems,
      userAgent: navigator.userAgent || 'Unknown Device',
    };
  
    console.log('Submitting:', orderData);
    try {
      // Εμφάνιση ένδειξης φόρτωσης
      setIsLoading(true);
  
      const response = await fetch('https://your-backend.onrender.com/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
  
      // Έλεγχος για αποτυχία απόκρισης
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Αποτυχία αποστολής παραγγελίας.');
      }
  
      const data = await response.json();
      console.log('Response data:', data);
      Alert.alert('Επιτυχία', 'Η παραγγελία καταχωρήθηκε με επιτυχία!');
  
      // Καθαρισμός φόρμας και κλείσιμο παραθύρου
      setOrderModalVisible(false);
      clearForm();
    } //catch (error) {
     // console.error('Error:', error);
     // Alert.alert('Σφάλμα', error.message || 'Κάτι πήγε στραβά!');
    //} 
    finally {
      // Απόκρυψη ένδειξης φόρτωσης
      setIsLoading(false);
    }
  };
  
  // Συνάρτηση για καθαρισμό της φόρμας
  const clearForm = () => {
    setFirstName('');
    setLastName('');
    setThl('');
    setPerioxh('');
    setDiefthinsi('');
    setKoudouni('');
    setSxolia('');
  };
  

  return (
    <>
      <TouchableOpacity style={styles.cartButton} onPress={() => setIsOpen(true)}>
        <Text>🛒 ({cartItems.length})</Text>
      </TouchableOpacity>

      <Modal visible={isOpen} onRequestClose={() => setIsOpen(false)} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Το Καλάθι μου</Text>

          <FlatList
            data={cartItems}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Image source={item.image} style={styles.cartItemImage} />

                <View style={styles.cartItemInfo}>
                  <Text>{item.name}</Text>
                  <Text>€{item.price.toFixed(2)} × {item.quantity}</Text>
                  <Text>Σύνολο: €{(item.price * item.quantity).toFixed(2)}</Text>
                </View>

                {/* Κουμπιά ελέγχου ποσότητας */}
                <View style={styles.cartQuantityControls}>
                  <TouchableOpacity onPress={() => addToCart({ ...item, quantity: 1 })} style={styles.synbutton}>
                    <Text style={styles.synena}>+</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.plhnbutton}>
                    <Text style={styles.plhnena}>-</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => deleteFromCart(item.id)}
                >
                  <Text style={styles.deleteButtonText}>Διαγραφή</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={item => item.id}
          />

          <Text style={styles.totalPriceText}>Σύνολο: {totalPrice.toFixed(2)}€ + 9€ τα μεταφορικά</Text>
          <Text style={styles.συνολικητιμη}> 👉 {(totalPrice+9).toFixed(2)}€</Text>
          <Text style={styles.arxikosynolo}>Αρχικό Σύνολο: {arxikoPrice.toFixed(2)}€</Text>
          <TouchableOpacity style={styles.buttonOrder} onPress={() => setOrderModalVisible(true)}>
            <Text>ΚΑΝΕ ΠΑΡΑΓΓΕΛΙΑ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => setIsOpen(false)}>
            <Text>ΚΛΕΙΣΙΜΟ</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      <Modal visible={isOrderModalVisible} onRequestClose={() => setOrderModalVisible(false)} animationType="slide">
  <View style={styles.modalContent}>
    <Text style={styles.label}>Όνομα:</Text>
    <TextInput
      placeholder="ΟΝΟΜΑ"
      value={firstName}
      onChangeText={setFirstName}
      style={styles.input}
    />

    <Text style={styles.label}>Επίθετο:</Text>
    <TextInput
      placeholder="Επίθετο"
      value={lastName}
      onChangeText={setLastName}
      style={styles.input}
    />

<Text style={styles.label}>Τηλέφωνο:</Text>
<TextInput
  placeholder="ΤΗΛΕΦΩΝΟ"
  value={thl}
  onChangeText={(value) => {
    // Κρατάμε μόνο αριθμούς (ως string κατά την εισαγωγή)
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length <= 10) {
      setThl(numericValue);
    }
  }}
  style={styles.input}
  keyboardType="numeric"
  maxLength={10}
/>

    <Text style={styles.label}>Περιοχή:</Text>
    <TextInput
      placeholder="ΠΕΡΙΟΧΗ"
      value={perioxh}
      maxLength={30}
      onChangeText={setPerioxh}
      style={styles.input}
    />

    <Text style={styles.label}>Διεύθυνση:</Text>
    <TextInput
      placeholder="ΔΙΕΥΘΗΝΣΗ"
      value={diefthinsi}
      maxLength={30}
      onChangeText={setDiefthinsi}
      style={styles.input}
    />

    <Text style={styles.label}>Κουδούνι:</Text>
    <TextInput
      placeholder="ΚΟΥΔΟΥΝΙ"
      value={koudouni}
      maxLength={30}
      onChangeText={setKoudouni}
      style={styles.input}
    />

    <Text style={styles.label}>Σχόλια:</Text>
    <TextInput
      placeholder="ΣΧΟΛΙΑ"
      value={sxolia}
      onChangeText={setSxolia}
      style={[styles.input, styles.commentInput]}
      maxLength={200}
      multiline={true}
      numberOfLines={4}
      textAlignVertical="top"
    />

<Button
  title="Υποβολή Παραγγελίας"
  onPress={() => {
    // Μετατροπή του τηλεφώνου σε αριθμό (integer)
    const phoneNumber = parseInt(thl, 10);

    if (!firstName || !lastName || thl.length !== 10 || !perioxh || !diefthinsi || !koudouni) {
      alert('Παρακαλώ συμπληρώστε όλα τα απαιτούμενα πεδία και βεβαιωθείτε ότι το τηλέφωνο έχει 10 ψηφία.');
      return;
    }

    // Στέλνουμε το phoneNumber ως αριθμό
    handleOrderSubmit({
      firstName,
      lastName,
      phoneNumber,
      perioxh,
      diefthinsi,
      koudouni,
      sxolia,
    });
  }}
/>

    <Button title="Κλείσιμο" onPress={() => setOrderModalVisible(false)} />
  </View>
</Modal>
    </>
  );
}

// ΣΤΑΘΕΡΟ ΩΣΤΕ ΝΑ ΚΡΑΤΑΕΙ ΤΑ STYLE ΚΑΙ ΤΗΝ ΔΟΜΗ ΤΩΝ ΠΡΟΙΟΝΤΩΝ ΜΕΣΑ ΣΕ ΚΑΘΕ ΣΕΛ
function ProductItem({ item }) {
  const { addToCart } = React.useContext(CartContext);
  const [isLoading, setIsLoading] = React.useState(false);
  const glowAnimation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [glowAnimation]);

  const glowColor = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ff00ff', '#00ffff'], // Εναλλαγή μεταξύ φούξια και γαλάζιου
  });

  const handleAddToCart = () => {
    setIsLoading(true);
    addToCart({ ...item, quantity: 1 });
    setTimeout(() => setIsLoading(false), 500); // Προσομοίωση καθυστέρησης
  };

  return (
    <View style={styles.item}>
      <Image source={item.image} style={styles.imageprod} />
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>ΤΙΜΗ: {item.price.toFixed(2)}€</Text>
      <Text style={styles.oldPrice}>ΑΠΟ {item.arxikh}€</Text>

      <Animated.Text style={[styles.ol, { textShadowColor: glowColor, textShadowRadius: 12 }]}> 
        ΟΛΑ ΤΑ {item.kathgoria} {item.ekptwsh}
      </Animated.Text>

      <Text style={styles.buttonTextprod}>ΕΩΣ {item.time}</Text>

      <TouchableOpacity
        style={[styles.buttonprod, styles.shadow]}
        onPress={handleAddToCart}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonTextprod}>ΠΡΟΣΘΗΚΗ ΣΤΟ ΚΑΛΑΘΙ</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
  



//ΑΡΧΙΚΗ ΟΘΟΝΗ
const HomeScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Fixed Logo and BrandName */}
      

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={require('./assets/qq.png')} style={styles.logo} />
        <Text style={styles.brandName}>Bakalogatos</Text>

        <TouchableOpacity style={styles.topRightButton} onPress={() => setModalVisible(true)}>
          <Text>🔔</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalTextBox}>
                <Text style={styles.καμπανακιtext}>Ο Bakalogatos εντοπίζει τις μεγαλύτερες προσφορές(instore και φυλλαδίων) των 5 μεγαλύτερων σουπερμάρκετ και στα φέρνει στο σπίτι με ένα ντιλίβερι</Text>
              </View>
              <View style={styles.closeButtonWrapper}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Κλείσιμο</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <TouchableOpacity onPress={() => navigation.navigate('Best')}>
          <View style={styles.box}>
            <Text style={styles.text}>👉 ΤΑ ΚΑΛΥΤΕΡΑ ΠΡΟΙΟΝΤΑ</Text>
          </View>
        </TouchableOpacity>

        {[
          { name: 'ab', image: require('./assets/ab.jpg') },
          { name: 'sklavenitis', image: require('./assets/sklavenitis.jpg') },
          { name: 'kritikos', image: require('./assets/kritikos.jpg') },
          { name: 'mymarket', image: require('./assets/mymarket.jpg') },
          { name: 'galaksias', image: require('./assets/galaksias.jpg') },
        ].map((item, index) => (
          <TouchableOpacity key={index} onPress={() => navigation.navigate(item.name)}>
            <Image source={item.image} style={styles.image} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <CartButton />
    </View>
  );
};
function BestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛒 Τα Καλύτερα Προϊόντα</Text>
      
    </View>
  );
}

//ΤΑ ΚΑΛΥΤΕΡΑ ΠΡΟΙΟΝΤΑ
function abScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFilterModalVisible, setFilterModalVisible] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [selectedBrands, setSelectedBrands] = React.useState([]);
  const [expandedCategory, setExpandedCategory] = React.useState(null);

  const categories = ['Απορρυπαντικά', 'Γαλακτομικά'];
const brandsByCategory = {
    'Απορρυπαντικά': ['vileda', 'AVA'],
    'Γαλακτομικά': ['vileda', 'AVA']
};

  // Φιλτράρισμα προϊόντων με βάση την αναζήτηση
  const filteredProducts = BestProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory ? product.kathgoria === selectedCategory : true) &&
    (selectedBrands.length > 0 ? selectedBrands.includes(product.brand) : true)
);
const handleRemoveCategory = (category) => {
  if (selectedCategory === category) {
      setSelectedCategory('');
  }
  setExpandedCategory(null);
};
  const handleSearch = () => {
    console.log('Αναζητήθηκε: ', searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const openFilterModal = () => {
    setFilterModalVisible(true);
  };

  const closeFilterModal = () => {
    setFilterModalVisible(false);
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setExpandedCategory(prev => (prev === category ? null : category));
  };

  const handleToggleBrand = (brand) => {
    setSelectedBrands(prevBrands =>
      prevBrands.includes(brand)
        ? prevBrands.filter(b => b !== brand)
        : [...prevBrands, brand]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedBrands([]);
    setExpandedCategory(null);
    closeFilterModal();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerab}>ΑΒ ΒΑΣΙΛΟΠΟΥΛΟΣ</Text>

      {/* Πεδίο Αναζήτησης με κουμπιά */}
      <View style={styles.searchContainer}>
        

        <TextInput
          style={styles.searchInput}
          placeholder="Αναζήτηση προϊόντων"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
        >
          <Text style={styles.searchButtonText}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearSearch}
        >
          <Text style={styles.clearButtonText}>×</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
          style={styles.filterButton}
          onPress={openFilterModal}
        >
          <Text style={styles.glowingText}>ΕΠΙΛΕΞΕ ΚΑΤΗΓΟΡΙΑ</Text>
        </TouchableOpacity>
      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => <ProductItem item={item} />}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
      />

      <CartButton />

      {/* Modal για τα Φίλτρα */}
      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeFilterModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Επιλέξτε Κατηγορία</Text>

            {categories.map(category => (
    <View key={category} style={styles.categoryContainer}>
        <TouchableOpacity
            style={styles.categoryButton}
            onPress={() => handleSelectCategory(category)}
        >
            <Text style={styles.categoryButtonText}>{category}</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleRemoveCategory(category)}
        >
            <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
        {expandedCategory === category && (
            brandsByCategory[category]?.map(brand => (
                <TouchableOpacity
                    key={brand}
                    style={
                        selectedBrands.includes(brand)
                            ? styles.selectedBrandButton
                            : styles.brandButton
                    }
                    onPress={() => handleToggleBrand(brand)}
                >
                    <Text style={styles.brandButtonText}>{brand}</Text>
                </TouchableOpacity>
            ))
        )}
    </View>
))}

            <TouchableOpacity onPress={handleClearFilters}>
              <Text style={styles.clearFiltersText}>Καθαρισμός Φίλτρων</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={closeFilterModal}>
              <Text style={styles.closeModalText}>Κλείσιμο</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
function sklavenitisScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.headerskl}>ΣΚΛΑΒΕΝΙΤΗΣ</Text>
      <FlatList
  data={sklaprods}
  renderItem={({ item }) => <ProductItem item={item} />}
  keyExtractor={item => item.id}
  numColumns={2}
  contentContainerStyle={styles.list}
  />
      <CartButton />
    </View>
  );
}

function kritikosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.headerkri}>ΚΡΗΤΙΚΟΣ</Text>
      <CartButton />
    </View>
  );
}
function mymarketScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.headermymarket}>MY MARKET</Text>
      <CartButton />
    </View>
  );
}
function galaksiasScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.headergal}>ΓΑΛΑΞΙΑΣ</Text>
      <CartButton />
    </View>
  );
}



const Stack = createStackNavigator();

export default function App() {
  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Best" component={BestScreen} />
          <Stack.Screen name="ab" component={abScreen} />
          <Stack.Screen name="sklavenitis" component={sklavenitisScreen} />
          <Stack.Screen name="kritikos" component={kritikosScreen} />
          <Stack.Screen name="mymarket" component={mymarketScreen} />
          <Stack.Screen name="galaksias" component={galaksiasScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  καμπανακιtext:{
    fontSize: 28,
    textAlign: 'center',
    color:'gold',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },closeButtonWrapper: {
    alignItems: 'center',
    marginTop: 20,
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: 'red',
    borderRadius: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#f8f8f8',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff', // White background for the header
    width: '100%',
  },
  logo: {
    width: 80,
    height: 80,
    marginRight: 10,
    position: 'absolute', // Ensures the logo is at the top left
    top: 10,
    left: 10,
  },
  backgroundImage: {
    flex: 1, // Θα καλύψει ολόκληρη την οθόνη
    justifyContent: 'center', // Κεντράρει το περιεχόμενο κάθετα
    alignItems: 'center', // Κεντράρει το περιεχόμενο οριζόντια
  },
  brandName: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000000', // Black text for brand name
    
    position: 'absolute', // Ensures the logo is at the top left
    top: 30,
    left: 100,
    fontStyle: 'italic',
    textShadowColor: '#888',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  topRightButton: {
    position: 'absolute',
    top: 30, // Same height as brandName
    right: 10, // Push to the right
    padding: 10,
    backgroundColor: 'black',
    borderRadius: 10,
  },
  scrollContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 80,
  },
  image: {
    width: 200,  // Πλάτος της εικόνας
    height: 200,  // Ύψος της εικόνας
    marginTop: 20,
  },productContainer: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  productPrice: {
    fontSize: 16,
    color: '#888',
  },
  
    
    box: {
      backgroundColor: 'red', // Κόκκινο κουτί
      padding: 20, // Εσωτερικό padding
      borderRadius: 10, // Στρογγυλεμένες γωνίες
      shadowColor: '#ff0000', // Κόκκινη σκιά για εφέ φωσφορισμού
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      //shadowRadius: 10,
      elevation: 10, // Για Android σκιά
      paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 12,
       // backgroundColor: '#ff00ff',
        shadowColor: '#00ffff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 20,
        color:'red',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    text: {
      fontSize: 24, // Μεγάλο κείμενο
      fontWeight: 'bold', // Έντονη γραμματοσειρά
      color: 'white', // Λευκό χρώμα κειμένου
      textAlign: 'center',
      textShadowColor: 'rgba(255, 255, 0, 0.8)', // Κίτρινο φωσφοριζέ εφέ
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 10,
    },
    buttonprod: {
      backgroundColor: 'lightgreen', // Κόκκινο κουτί
      padding: 10, // Μικρότερο εσωτερικό padding
      borderRadius: 5, // Στρογγυλεμένες γωνίες
      shadowColor: '#ff0000', // Κόκκινη σκιά για εφέ φωσφορισμού
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 6,
      elevation: 5, // Για Android σκιά
    
      // Προσθήκη εφέ
      transform: [{ scale: 1 }], // Σημασία για το animation
      transition: 'transform 0.1s ease-in-out', // Ομαλή αλλαγή όταν γίνεται κλικ
    },
    buttonprodPressed: {
      transform: [{ scale: 1.2 }], // Κάνει το κουμπί να μεγαλώνει όταν πατιέται
    },
    buttonTextprod:{
      
    },
    price:{
      color: '#333',
      fontWeight: 'bold',
      color: 'red'
      //backgroundColor: 'red',
    },
    header: {
      fontSize: 28, // Μεγάλο κείμενο
      fontWeight: 'bold', // Έντονη γραμματοσειρά
      textAlign: 'center', // Κεντράρισμα οριζόντια
      marginBottom: 20, // Απόσταση από το FlatList
      color: '#333', // Σκούρο γκρι για καλύτερη αντίθεση
      backgroundColor: 'red', // Προαιρετικό κόκκινο background για έμφαση
      paddingVertical: 10, // Εσωτερικό padding για καλύτερη εμφάνιση
      paddingHorizontal: 20, // Οριζόντιο padding
      borderRadius: 10, // Στρογγυλεμένες γωνίες
      width: '100%', // Να καλύπτει όλο το πλάτος
      position: 'absolute', // Σταθερή θέση στην κορυφή
      top: 0, // Το φέρνει στο πάνω μέρος της οθόνης
    },
    headerab: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
      color:'blue'
    },
    
    headerskl:{
      fontSize: 28, // Μεγάλο κείμενο
      fontWeight: 'bold', // Έντονη γραμματοσειρά
      textAlign: 'center', // Κεντράρισμα οριζόντια
      marginBottom: 20, // Απόσταση από το FlatList
      color: '#333', // Σκούρο γκρι για καλύτερη αντίθεση
      backgroundColor: 'orange', // Προαιρετικό κόκκινο background για έμφαση
      paddingVertical: 10, // Εσωτερικό padding για καλύτερη εμφάνιση
      paddingHorizontal: 20, // Οριζόντιο padding
      borderRadius: 10, // Στρογγυλεμένες γωνίες
      width: '100%', // Να καλύπτει όλο το πλάτος
      position: 'absolute', // Σταθερή θέση στην κορυφή
      top: 0, // Το φέρνει στο πάνω μέρος της οθόνης
    },
    headerkri:{
      fontSize: 28, // Μεγάλο κείμενο
      fontWeight: 'bold', // Έντονη γραμματοσειρά
      textAlign: 'center', // Κεντράρισμα οριζόντια
      marginBottom: 20, // Απόσταση από το FlatList
      color: '#333', // Σκούρο γκρι για καλύτερη αντίθεση
      backgroundColor: 'red', // Προαιρετικό κόκκινο background για έμφαση
      paddingVertical: 10, // Εσωτερικό padding για καλύτερη εμφάνιση
      paddingHorizontal: 20, // Οριζόντιο padding
      borderRadius: 10, // Στρογγυλεμένες γωνίες
      width: '100%', // Να καλύπτει όλο το πλάτος
      position: 'absolute', // Σταθερή θέση στην κορυφή
      top: 0, // Το φέρνει στο πάνω μέρος της οθόνης
    },
    headermymarket:{
      fontSize: 28, // Μεγάλο κείμενο
      fontWeight: 'bold', // Έντονη γραμματοσειρά
      textAlign: 'center', // Κεντράρισμα οριζόντια
      marginBottom: 20, // Απόσταση από το FlatList
      color: '#333', // Σκούρο γκρι για καλύτερη αντίθεση
      backgroundColor: 'red', // Προαιρετικό κόκκινο background για έμφαση
      paddingVertical: 10, // Εσωτερικό padding για καλύτερη εμφάνιση
      paddingHorizontal: 20, // Οριζόντιο padding
      borderRadius: 10, // Στρογγυλεμένες γωνίες
      width: '100%', // Να καλύπτει όλο το πλάτος
      position: 'absolute', // Σταθερή θέση στην κορυφή
      top: 0, // Το φέρνει στο πάνω μέρος της οθόνης
    },
    headergal:{
      fontSize: 28, // Μεγάλο κείμενο
      fontWeight: 'bold', // Έντονη γραμματοσειρά
      textAlign: 'center', // Κεντράρισμα οριζόντια
      marginBottom: 20, // Απόσταση από το FlatList
      color: '#333', // Σκούρο γκρι για καλύτερη αντίθεση
      backgroundColor: 'blue', // Προαιρετικό κόκκινο background για έμφαση
      paddingVertical: 10, // Εσωτερικό padding για καλύτερη εμφάνιση
      paddingHorizontal: 20, // Οριζόντιο padding
      borderRadius: 10, // Στρογγυλεμένες γωνίες
      width: '100%', // Να καλύπτει όλο το πλάτος
      position: 'absolute', // Σταθερή θέση στην κορυφή
      top: 0, // Το φέρνει στο πάνω μέρος της οθόνης
    },
    imageprod: {
      width: 200,
      height: 200,
      
      marginTop: 50,  // Μετακινεί την εικόνα λίγο πιο κάτω
      marginBottom: 0, // Καταργεί το κενό κάτω από την εικόνα
    },
    cartButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: '#ff4444',
      padding: 15,
      borderRadius: 30,
      zIndex: 1000,
    },
    
    shadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
   
    },
  
    modalContent: {
      flex: 1,
      marginTop: 50,
      backgroundColor: 'white',
      paddingTop: 20,
      paddingHorizontal: 20,
    },
  
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
    },
  
    cartItem: {
      flexDirection: 'row',
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
  
    cartItemImage: {
      width: 80,
      height: 80,
      resizeMode: 'contain',
    },
  
    cartItemDetails: {
      flex: 1,
      marginLeft: 10,
      justifyContent: 'space-between',
    },
  
    cartItemName: {
      fontSize: 16,
      fontWeight: 'bold',
    },
  
    cartItemPrice: {
      fontSize: 16,
      color: '#666',
    },
  
    removeButton: {
      padding: 5,
      backgroundColor: '#ffebee',
      borderRadius: 5,
    },
  
    removeButtonText: {
      color: '#ff4444',
      fontSize: 14,
    },
  
    button: {
      backgroundColor: '#ff4444',
      padding: 15,
      borderRadius: 10,
      marginTop: 20,
      alignSelf: 'flex-end',
    },
  
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    cartItemActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      },
      greenButton: {
      backgroundColor: 'green',
      padding: 5,
      borderRadius: 5,
      },
      redButton: {
      backgroundColor: 'red',
      padding: 5,
      borderRadius: 5,
      },
      deleteButton: {
      backgroundColor: 'gray',
      padding: 5,
      borderRadius: 5,
      },
      actionText: {
      color: 'white',
      fontSize: 16,
      },
      quantityText: {
      fontSize: 16,
      fontWeight: 'bold',
      },
      totalPriceContainer: {
        backgroundColor: '#f8f8f8',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3
    },
    totalPriceText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
    },
    buttonorderText:{
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    buttonOrder:{
      backgroundColor: 'green',
      padding: 15,
      borderRadius: 10,
      marginTop: 20,
      //alignSelf: 'flex-end',
    },
    modalContent: { padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    input: { borderWidth: 1, padding: 10, marginVertical: 5 },
    plhnbutton: {
      backgroundColor: 'red', 
      padding: 10,
      borderRadius: 5,
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5, // Για Android σκιά
      marginLeft:20,
    },
    plhnena: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center',
    },
    synbutton: {
      backgroundColor: 'green', 
      padding: 10,
      borderRadius: 5,
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5, // Για Android σκιά
      marginLeft:20,
     
      
    },
    synena: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center',
    },
    quantity: {
      fontSize: 24, // Αυξάνει το μέγεθος
      fontWeight: 'bold', // Κάνει το κείμενο bold
      color: 'black', // Μπορείς να αλλάξεις το χρώμα αν θέλεις
      textAlign: 'center', // Αν το θέλεις κεντραρισμένο
      marginLeft:20,
    },
    deleteButton: {
      backgroundColor: 'grey',
      paddingVertical: 4, // Κάθετο padding για καλύτερη εμφάνιση
      paddingHorizontal: 8, // Οριζόντιο padding, μικρότερο για να είναι πιο κοντό σε μήκος
      borderRadius: 5,
      alignItems: 'center', // Κεντράρει το κείμενο οριζόντια
      justifyContent: 'center', // Κεντράρει το κείμενο κάθετα
      //minWidth: 5, // Περιορίζει το πλάτος του κουμπιού
      marginLeft: 'auto',
     // marginVertical: 5,
    },
    deleteButtonText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center', // Εξασφαλίζει ότι το κείμενο είναι στο κέντρο
    },
    oldPrice: {
      fontSize: 14,  // Μικρότερο μέγεθος γραμματοσειράς για την αρχική τιμή
      color: 'black', // Μαύρο χρώμα για την αρχική τιμή
      textDecorationLine: 'line-through', // Προσθέτει την γραμμή διαγραφής
      textDecorationColor: 'red', // Κόκκινη γραμμή διαγραφής
    },
    
    searchContainer: {
      flexDirection: 'row', // Παράλληλη διάταξη
      alignItems: 'center',
      marginBottom: 20,
    },
    searchInput: {
      flex: 1, // Καταλαμβάνει τον διαθέσιμο χώρο
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      fontSize: 16,
      backgroundColor: '#fff',
    },
    searchButton: {
      backgroundColor: 'green',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 5,
      marginLeft: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchButtonText: {
      color: '#fff',
      fontSize: 20, // Βέλος
    },
    clearButton: {
      backgroundColor: 'red',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 5,
      marginLeft: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    clearButtonText: {
      color: '#fff',
      fontSize: 20, // Χ
    },
    
    list: {
      flexGrow: 1,
      justifyContent: 'space-around',
    },
    ol:{ color: 'red',
      
      fontWeight: 'bold',
      textTransform: 'uppercase',
     },
     modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalBox: {
      width: '80%',
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    categoryButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
      backgroundColor: '#1E90FF',
      marginBottom: 10,
    },
    categoryButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    closeModalText: {
      marginTop: 20,
      fontSize: 16,
      color: '#FF6347',
    },clearFiltersText: {
      marginTop: 20,
      fontSize: 16,
      color: '#FF6347',
      fontWeight: 'bold',
    },
    brandButton: {
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 8,
      backgroundColor: '#87CEFA',
      marginTop: 5,
      marginLeft: 20,
    },
    brandButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },selectedBrandButton: {
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 8,
      backgroundColor: '#4682B4',
      marginTop: 5,
      marginLeft: 20,
    },
    commentInput: {
      height: 100, // Αυξάνουμε το ύψος για να φαίνεται μεγαλύτερο
      borderColor: '#007BFF', // Χρώμα πλαισίου για να ξεχωρίζει
      backgroundColor: '#f0f8ff', // Ανοιχτό χρώμα φόντου για να είναι πιο ορατό
      fontSize: 16, // Μεγαλύτερο μέγεθος γραμματοσειράς
      paddingTop: 10, // Ελάχιστο padding για να μην κολλάει το κείμενο στην κορυφή
      textAlignVertical: 'top', // Τοποθετεί το κείμενο από πάνω
      borderRadius: 5,
      marginBottom: 15, // Απόσταση από άλλα στοιχεία
    },
    arxikosynolo: {
        fontWeight: 'bold',       // Έντονα γράμματα
        color: 'red',             // Κόκκινο χρώμα
        textDecorationLine: 'line-through',
        fontSize:18,
    },
    συνολικητιμη:{
      fontSize: 18,
        fontWeight: 'bold',
        
      color:'green',
    },
    glowingText: {
    
     
        backgroundColor: 'lightgreen', // Κόκκινο κουτί
        padding: 10, // Μικρότερο εσωτερικό padding
        borderRadius: 5, // Στρογγυλεμένες γωνίες
        shadowColor: '#ff0000', // Κόκκινη σκιά για εφέ φωσφορισμού
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 6,
        elevation: 5, // Για Android σκιά
      
        // Προσθήκη εφέ
        transform: [{ scale: 1 }], // Σημασία για το animation
        transition: 'transform 0.1s ease-in-out', // Ομαλή αλλαγή όταν γίνεται κλικ
      
    },
  
  // Στυλ για animation (πρέπει να προσθέσουμε animation για το φως)
  
  });
 