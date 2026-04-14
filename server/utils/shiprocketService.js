const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1';
let cachedToken = null;
let tokenExpiry = null;

async function getAuthToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    console.log('=== SHIPROCKET AUTH START ===');
    console.log('API Key exists:', !!process.env.SHIPROCKET_API_KEY);

    const response = await fetch(`${SHIPROCKET_BASE_URL}/external/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_API_EMAIL,
        password: process.env.SHIPROCKET_API_PASSWORD,
      }),
    });

    console.log('Auth response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Shiprocket auth error response:', error);
      throw new Error(error.message || 'Auth failed');
    }

    const data = await response.json();
    console.log('Auth response data keys:', Object.keys(data));
    console.log('Token exists:', !!data.token);
    console.log('Token sample:', data.token ? data.token.substring(0, 20) + '...' : 'none');

    cachedToken = data.token;
    tokenExpiry = Date.now() + (23 * 60 * 60 * 1000);

    console.log('=== SHIPROCKET AUTH END ===');
    return cachedToken;
  } catch (error) {
    console.error('Shiprocket auth error:', error.message);
    throw new Error('Failed to authenticate with Shiprocket');
  }
}

async function getTrackingDetails(trackingNumber) {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${SHIPROCKET_BASE_URL}/courier/track/number/${trackingNumber}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return {
        trackingNumber,
        status: 'not_found',
        message: 'Tracking information not available',
      };
    }

    const data = await response.json();

    if (data && data.tracking_data) {
      const tracking = data.tracking_data;
      return {
        trackingNumber,
        status: tracking.shipment_status || 'unknown',
        currentLocation: tracking.current_location || 'unknown',
        lastUpdate: tracking.last_updated || null,
        events: tracking.track_events || [],
        estimatedDelivery: tracking.estimated_delivery_date || null,
        carrier: tracking.courier_name || 'Shiprocket',
      };
    }

    return {
      trackingNumber,
      status: 'not_found',
      message: 'Tracking information not available',
    };
  } catch (error) {
    console.error('Shiprocket tracking error:', error.message);
    throw new Error('Failed to fetch tracking details from Shiprocket');
  }
}

async function searchOrdersByPhone(phone) {
  try {
    const token = await getAuthToken();

    const url = new URL(`${SHIPROCKET_BASE_URL}/orders/search`);
    url.searchParams.set('search_type', 'mobile_number');
    url.searchParams.set('search_value', phone);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Shiprocket search error:', error.message);
    return [];
  }
}

async function getShipmentTrack(shipmentId) {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${SHIPROCKET_BASE_URL}/shipments/track/shipment/${shipmentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data && data.track_shipments && data.track_shipments.length > 0) {
      const shipment = data.track_shipments[0];
      return {
        shipmentId,
        orderId: shipment.order_id,
        trackingNumber: shipment.track_id,
        status: shipment.shipment_status,
        carrier: shipment.courier_company_name,
        currentLocation: shipment.current_location,
        estimatedDelivery: shipment.estimated_delivery,
        events: shipment.track_events || [],
        lastUpdate: shipment.last_updated,
      };
    }

    return null;
  } catch (error) {
    console.error('Shiprocket shipment track error:', error.message);
    throw new Error('Failed to fetch shipment tracking');
  }
}

async function getAreaWiseCharges(pincode) {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${SHIPROCKET_BASE_URL}/settings/warehouse/serviceability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        pickup_postcode: process.env.SHIPROCKET_PICKUP_PINCODE || '110001',
        delivery_postcode: String(pincode),
        weight: 0.5,
        cod: 1,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.warn('Shiprocket serviceability check failed:', error);
      return {
        available: false,
        charges: 0,
        message: 'Service not available for this area',
      };
    }

    const data = await response.json();

    if (data.status === 200 && data.data && data.data.length > 0) {
      const serviceOption = data.data[0];
      return {
        pincode,
        available: true,
        charges: Number(serviceOption.rate || 0),
        serviceName: serviceOption.name || 'Standard',
        deliveryDays: Number(serviceOption.delivery_days || 0),
        courierCompany: serviceOption.courier_name || 'Shiprocket',
      };
    }

    return {
      available: false,
      charges: 0,
      message: 'Service not available for this area',
    };
  } catch (error) {
    console.error('Shiprocket area charges error:', error.message);
    return {
      available: false,
      charges: 0,
      message: 'Failed to fetch shipping charges',
    };
  }
}

async function getPickupLocations() {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${SHIPROCKET_BASE_URL}/external/company/pickup-locations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch pickup locations:', error.message);
    return [];
  }
}

async function createOrder(orderData) {
  try {
    const token = await getAuthToken();

    console.log('=== SHIPROCKET ORDER CREATION START ===');
    console.log('Order data:', JSON.stringify(orderData, null, 2));
    console.log('Token sample:', token ? token.substring(0, 20) + '...' : 'none');

    const response = await fetch(`${SHIPROCKET_BASE_URL}/external/orders/create/adhoc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    console.log('Order creation response status:', response.status);

    const data = await response.json();

    // Check if response contains an error message even if status is 200
    if (data.message && data.message.includes('Pickup location') && data.data?.data) {
      console.log('Pickup location error detected, extracting valid locations');
      const pickupLocations = data.data.data;
      console.log('Valid pickup locations:', JSON.stringify(pickupLocations, null, 2));

      if (pickupLocations.length > 0) {
        const validPickupLocation = pickupLocations[0].pickup_location;
        console.log('Retrying with pickup location:', validPickupLocation);

        orderData.pickup_location = validPickupLocation;

        const retryResponse = await fetch(`${SHIPROCKET_BASE_URL}/external/orders/create/adhoc`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        });

        console.log('Retry response status:', retryResponse.status);

        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          console.log('Shiprocket order created successfully on retry:', retryData);
          console.log('=== SHIPROCKET ORDER CREATION END ===');
          return retryData;
        } else {
          const retryError = await retryResponse.json().catch(() => ({ message: 'Failed to create order' }));
          console.error('Shiprocket retry error:', retryError);
          throw new Error(retryError.message || 'Failed to create order in Shiprocket');
        }
      }
    }

    if (!response.ok) {
      console.error('Shiprocket order creation error:', data);
      throw new Error(data.message || 'Failed to create order in Shiprocket');
    }

    console.log('Shiprocket order created successfully:', data);
    console.log('=== SHIPROCKET ORDER CREATION END ===');
    return data;
  } catch (error) {
    console.error('Shiprocket create order error:', error.message);
    throw error;
  }
}

module.exports = {
  getAuthToken,
  getTrackingDetails,
  searchOrdersByPhone,
  getShipmentTrack,
  getAreaWiseCharges,
  createOrder,
};
