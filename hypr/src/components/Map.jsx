import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Search, Package, AlertCircle } from "lucide-react";

function Map() {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchProduct, setSearchProduct] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const LOW_STOCK_THRESHOLD = 5;

  // Enhanced sample data with stock information
  const thaneData = {
    locality: "Thane",
    total_users: 15,
    users: [
      {
        user_id: 1,
        username: "Raj Mehta",
        email: "raj.m@example.com",
        role: "owner",
        locality: "Thane West",
        location: [72.9769, 19.2183],
        products: [
          {
            product_id: 1,
            product_name: "Organic Chocolates",
            description: "Premium dark chocolate",
            price: 299,
            stock: 3,
            created_at: "2024-10-26 00:38:18",
          },
          {
            product_id: 2,
            product_name: "Dairy Milk Pack",
            description: "Family pack chocolates",
            price: 499,
            stock: 15,
            created_at: "2024-10-26 00:45:45",
          },
        ],
      },
      {
        user_id: 2,
        username: "Priya Sharma",
        email: "priya.s@example.com",
        role: "owner",
        locality: "Ghodbunder Road",
        location: [72.9442, 19.237],
        products: [
          {
            product_id: 3,
            product_name: "Chocolate Gift Box",
            description: "Assorted chocolates",
            price: 799,
            stock: 2,
            created_at: "2024-10-26 01:38:18",
          },
          {
            product_id: 1,
            product_name: "Organic Chocolates",
            description: "Premium dark chocolate",
            price: 299,
            stock: 20,
            created_at: "2024-10-26 01:45:18",
          },
        ],
      },
      // ... (previous users data with added stock information)
    ],
  };

  const filterUsersByProduct = (
    users,
    searchTerm,
    showLowStockOnly = false
  ) => {
    if (!searchTerm && !showLowStockOnly) return users;

    return users.filter((user) => {
      const products = user.products;

      if (showLowStockOnly) {
        const hasLowStock = products.some(
          (product) => product.stock <= LOW_STOCK_THRESHOLD
        );
        if (!hasLowStock) return false;
      }

      if (searchTerm) {
        const lowercaseSearch = searchTerm.toLowerCase();
        return products.some((product) =>
          product.product_name.toLowerCase().includes(lowercaseSearch)
        );
      }

      return true;
    });
  };

  const findAlternativeStockLocations = (productName) => {
    const locations = [];
    thaneData.users.forEach((user) => {
      const matchingProducts = user.products.filter(
        (product) =>
          product.product_name.toLowerCase() === productName.toLowerCase()
      );

      if (matchingProducts.length > 0) {
        locations.push({
          locality: user.locality,
          username: user.username,
          email: user.email,
          stock: matchingProducts[0].stock,
          price: matchingProducts[0].price,
        });
      }
    });

    return locations.sort((a, b) => b.stock - a.stock);
  };

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiYW51c2hsaW51eCIsImEiOiJjbTJvcnByaHgwa2J1MmxzM3N0NnA4NGFpIn0.yZKh-tUaYq-_Pg49iU9x4g";

    const initializeMap = async () => {
      const thaneCenter = [72.9615, 19.2183];

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/dark-v10",
        center: thaneCenter,
        zoom: 12.5,
      });

      mapRef.current = map;

      map.on("load", () => {
        const filteredUsers = filterUsersByProduct(
          thaneData.users,
          searchProduct,
          showLowStock
        );

        const geojsonData = {
          type: "FeatureCollection",
          features: filteredUsers.map((user) => {
            const productCount = user.products.length;
            const matchingProducts = user.products.filter((product) =>
              product.product_name
                .toLowerCase()
                .includes(searchProduct.toLowerCase())
            );
            const hasLowStock = user.products.some(
              (product) => product.stock <= LOW_STOCK_THRESHOLD
            );

            return {
              type: "Feature",
              properties: {
                ...user,
                intensity: searchProduct
                  ? matchingProducts.length / productCount
                  : 1,
                hasLowStock,
              },
              geometry: {
                type: "Point",
                coordinates: user.location,
              },
            };
          }),
        };

        if (map.getSource("user-data")) {
          map.removeLayer("heatmap-layer");
          map.removeLayer("user-layer");
          map.removeSource("user-data");
        }

        map.addSource("user-data", {
          type: "geojson",
          data: geojsonData,
        });

        map.addLayer({
          id: "heatmap-layer",
          type: "heatmap",
          source: "user-data",
          paint: {
            "heatmap-weight": [
              "interpolate",
              ["linear"],
              ["get", "intensity"],
              0,
              0,
              1,
              2,
            ],
            "heatmap-intensity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              1,
              9,
              5,
            ],
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(33,102,172,0)",
              0.2,
              showLowStock ? "rgb(239,138,98)" : "rgb(103,169,207)",
              0.4,
              showLowStock ? "rgb(178,24,43)" : "rgb(209,229,240)",
              0.6,
              showLowStock ? "rgb(178,24,43)" : "rgb(253,219,199)",
              0.8,
              showLowStock ? "rgb(178,24,43)" : "rgb(239,138,98)",
              1,
              showLowStock ? "rgb(178,24,43)" : "rgb(178,24,43)",
            ],
            "heatmap-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              40,
              9,
              80,
            ],
            "heatmap-opacity": 0.8,
          },
        });

        map.addLayer({
          id: "user-layer",
          type: "circle",
          source: "user-data",
          paint: {
            "circle-radius": 20,
            "circle-color": [
              "case",
              ["get", "hasLowStock"],
              "rgba(178,24,43,0.3)",
              "rgba(0,0,0,0)",
            ],
            "circle-opacity": 0.3,
          },
        });

        const handleUserClick = (e) => {
          if (e.features.length > 0) {
            const user = e.features[0].properties;
            const parsedUser = {
              ...user,
              products: JSON.parse(user.products),
            };
            setSelectedUser(parsedUser);
          }
        };

        map.on("click", "user-layer", handleUserClick);
        map.on("click", (e) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ["user-layer"],
          });
          if (features.length === 0) {
            setSelectedUser(null);
          }
        });

        map.on("mouseenter", "user-layer", () => {
          map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", "user-layer", () => {
          map.getCanvas().style.cursor = "";
        });
      });

      return () => map.remove();
    };

    initializeMap();
  }, [searchProduct, showLowStock]);

  return (
    <div className="relative w-full h-[97vh]">
      {selectedUser && (
        <div className="absolute top-4 left-4 mt-20 z-10 max-w-sm bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-lg text-gray-800">
              {selectedUser.username}
            </h3>
            <p className="text-gray-600 text-sm">Email: {selectedUser.email}</p>
            <p className="text-gray-600 text-sm">
              Location: {selectedUser.locality}
            </p>
          </div>

          <div className="p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Products:</h4>
            <div className="space-y-3">
              {selectedUser.products.map((product) => {
                const isLowStock = product.stock <= LOW_STOCK_THRESHOLD;
                const alternativeLocations = isLowStock
                  ? findAlternativeStockLocations(product.product_name)
                  : [];

                return (
                  <div
                    key={product.product_id}
                    className="p-3 bg-gray-50 rounded-md border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div
                        className={`${
                          searchProduct &&
                          product.product_name
                            .toLowerCase()
                            .includes(searchProduct.toLowerCase())
                            ? "font-bold text-green-600"
                            : "text-gray-800"
                        }`}
                      >
                        {product.product_name}
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          isLowStock
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        Stock: {product.stock}
                      </span>
                    </div>

                    <div className="mt-1 text-sm text-gray-600">
                      Price: ₹{product.price} | Created:{" "}
                      {new Date(product.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.description}
                    </div>

                    {isLowStock && alternativeLocations.length > 0 && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                        <div className="flex items-center gap-1 text-yellow-700 mb-1">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Available at other locations:
                          </span>
                        </div>
                        {alternativeLocations.map((loc, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-yellow-800 ml-5"
                          >
                            • {loc.locality} - {loc.stock} units (₹{loc.price})
                            <br />
                            Contact: {loc.username} ({loc.email})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-white opacity-50" />
          <input
            type="text"
            value={searchProduct}
            onChange={(e) => setSearchProduct(e.target.value)}
            placeholder="Search for products..."
            className="pl-8 p-2 rounded-lg shadow-lg bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border border-white border-opacity-10 text-white w-64"
          />
        </div>
        <button
          onClick={() => setShowLowStock(!showLowStock)}
          className={`flex items-center gap-2 p-2 rounded-lg shadow-lg backdrop-filter backdrop-blur-lg border border-white border-opacity-10 ${
            showLowStock
              ? "bg-red-500 text-white"
              : "bg-white bg-opacity-10 text-white"
          }`}
        >
          <Package className="h-4 w-4" />
          Low Stock
        </button>
      </div>

      <div
        id="map-container"
        ref={mapContainerRef}
        className="w-full h-screen"
      />
    </div>
  );
}

export default Map;
