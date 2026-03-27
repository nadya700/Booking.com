import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

const paymentMethodOptions = [
  { value: 'credit_card', label: 'Credit card' },
  { value: 'debit_card', label: 'Debit card' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'paypal', label: 'PayPal' },
]

const initialPropertyForm = {
  title: '',
  location: '',
  type: 'Hotel',
  image_url: '',
  stars: 4,
  rating: 8.5,
  reviews_count: 0,
  price_per_night: 120,
  max_guests: 2,
  free_cancellation: true,
  breakfast_included: true,
  pet_friendly: false,
  wifi_included: true,
  parking_included: false,
  room_size_sqm: 24,
  bed_type: 'Queen Bed',
  description: '',
}

const parseRoomIdFromHash = () => {
  const hash = window.location.hash.replace('#', '')
  const match = hash.match(/^\/rooms\/(\d+)$/)

  if (!match) return null

  const id = Number(match[1])
  return Number.isFinite(id) ? id : null
}

const formatPaymentMethod = (method) => {
  if (!method) return 'Not selected'

  const option = paymentMethodOptions.find((item) => item.value === method)
  return option ? option.label : method
}

const formatStayDate = (value) => {
  if (!value) return ''
  return String(value).split('T')[0]
}

function App() {
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(null)
  const [properties, setProperties] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [bookings, setBookings] = useState([])
  const [paymentMethodByBooking, setPaymentMethodByBooking] = useState({})
  const [availability, setAvailability] = useState([])
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [activeRoomId, setActiveRoomId] = useState(() => parseRoomIdFromHash())
  const [roomDetails, setRoomDetails] = useState(null)
  const [roomLoading, setRoomLoading] = useState(false)
  const [propertyForm, setPropertyForm] = useState(initialPropertyForm)
  const [propertyImageFile, setPropertyImageFile] = useState(null)
  const [editingPropertyId, setEditingPropertyId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filters, setFilters] = useState({
    location: '',
    guests: 2,
    min_price: '',
    max_price: '',
  })
  const [bookingForm, setBookingForm] = useState({
    guest_name: '',
    guest_email: '',
    check_in: '',
    check_out: '',
    guests: 2,
  })

  const apiRequest = useCallback(async (url, options = {}) => {
    const hasFormData = options.body instanceof FormData
    const headers = {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(hasFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    const response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers,
    })
    const rawBody = await response.text()
    let payload = {}

    if (rawBody) {
      try {
        payload = JSON.parse(rawBody)
      } catch {
        const objectStart = rawBody.indexOf('{')
        const objectEnd = rawBody.lastIndexOf('}')

        if (objectStart !== -1 && objectEnd > objectStart) {
          try {
            payload = JSON.parse(rawBody.slice(objectStart, objectEnd + 1))
          } catch {
            payload = {}
          }
        }
      }
    }

    if (!response.ok) {
      const firstError = payload.message
        || Object.values(payload.errors || {})[0]?.[0]
        || rawBody.slice(0, 180)
      throw new Error(firstError || 'Request failed')
    }

    return payload
  }, [token])

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (String(value).trim() !== '') {
        params.set(key, value)
      }
    })
    return params.toString()
  }, [filters])

  const favoriteIds = useMemo(
    () => new Set(favorites.map((item) => item.property_id)),
    [favorites]
  )

  useEffect(() => {
    const onHashChange = () => {
      setActiveRoomId(parseRoomIdFromHash())
      setSuccess('')
      setError('')
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }

    const loadMe = async () => {
      try {
        const me = await apiRequest('/api/me')
        setUser(me)
      } catch {
        localStorage.removeItem('token')
        setToken('')
      }
    }

    loadMe()
  }, [token, apiRequest])

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true)
      setError('')

      try {
        const res = await fetch(`/api/properties?${queryString}`)
        if (!res.ok) throw new Error('Could not load properties')
        const data = await res.json()
        setProperties(data)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [queryString])

  useEffect(() => {
    if (!activeRoomId) {
      setRoomDetails(null)
      setAvailability([])
      return
    }

    const fetchRoomDetails = async () => {
      setRoomLoading(true)
      setError('')

      try {
        const res = await fetch(`/api/properties/${activeRoomId}`)
        if (!res.ok) throw new Error('Could not load this room.')
        const payload = await res.json()
        setRoomDetails(payload)
        setBookingForm((prev) => ({
          ...prev,
          guests: Math.min(Number(prev.guests) || 1, payload.max_guests),
        }))
      } catch (requestError) {
        setRoomDetails(null)
        setError(requestError.message)
      } finally {
        setRoomLoading(false)
      }
    }

    fetchRoomDetails()
  }, [activeRoomId, apiRequest])

  useEffect(() => {
    if (!roomDetails) {
      setAvailability([])
      return
    }

    const fetchAvailability = async () => {
      setAvailabilityLoading(true)
      try {
        const payload = await apiRequest(`/api/properties/${roomDetails.id}/availability`)
        setAvailability(payload.days || [])
      } catch {
        setAvailability([])
      } finally {
        setAvailabilityLoading(false)
      }
    }

    fetchAvailability()
  }, [roomDetails, apiRequest])

  useEffect(() => {
    if (!user || user.role !== 'guest') return

    const loadUserData = async () => {
      try {
        const [favoritesData, bookingsData] = await Promise.all([
          apiRequest('/api/favorites'),
          apiRequest('/api/bookings'),
        ])

        setFavorites(favoritesData)
        setBookings(bookingsData)
      } catch {
        // keep listing usable even if side panel calls fail
      }
    }

    loadUserData()
  }, [user, apiRequest])

  useEffect(() => {
    if (user?.role === 'guest') {
      setBookingForm((prev) => ({
        ...prev,
        guest_name: prev.guest_name || user.name,
        guest_email: prev.guest_email || user.email,
      }))
    }
  }, [user, apiRequest])

  useEffect(() => {
    if (!bookings.length) return

    setPaymentMethodByBooking((prev) => {
      const next = { ...prev }
      bookings.forEach((booking) => {
        if (!next[booking.id]) {
          next[booking.id] = booking.payment_method || 'credit_card'
        }
      })
      return next
    })
  }, [bookings])

  useEffect(() => {
    if (!user || user.role !== 'admin') return

    const loadAnalytics = async () => {
      try {
        const payload = await apiRequest('/api/admin/analytics')
        setAnalytics(payload)
      } catch {
        // keep UI responsive even if analytics temporarily fails
      }
    }

    loadAnalytics()
  }, [user, apiRequest])

  const openRoomDetails = (propertyId) => {
    window.location.hash = `/rooms/${propertyId}`
  }

  const returnToListing = () => {
    window.location.hash = '/'
  }

  const handleBooking = async (event) => {
    event.preventDefault()

    if (!roomDetails) return

    if (!user || user.role !== 'guest') {
      setError('Please login as a guest to reserve this room.')
      return
    }

    setError('')
    setSuccess('')

    try {
      const payload = await apiRequest('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          ...bookingForm,
          guests: Number(bookingForm.guests),
          property_id: roomDetails.id,
        }),
      })

      const propertyTitle =
        payload?.property?.title || roomDetails?.title || 'your selected property'
      const totalPrice = payload?.total_price ?? 'N/A'

      setSuccess(
        `Reservation confirmed for ${propertyTitle}. Total: $${totalPrice}. You can pay in the reservations section.`
      )
      const newBookings = await apiRequest('/api/bookings')
      setBookings(newBookings)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const payBooking = async (bookingId) => {
    setError('')
    setSuccess('')

    try {
      const payload = await apiRequest(`/api/bookings/${bookingId}/pay`, {
        method: 'POST',
        body: JSON.stringify({
          payment_method: paymentMethodByBooking[bookingId] || 'credit_card',
        }),
      })

      setBookings((prev) => prev.map((item) => (item.id === payload.id ? payload : item)))
      setSuccess(`Payment completed for ${payload.property?.title}.`)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    try {
      const endpoint = authMode === 'register' ? '/api/register' : '/api/login'
      const payload = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(authForm),
      })

      const nextToken = payload?.token
        || payload?.data?.token
        || payload?.access_token
        || payload?.data?.access_token
        || null

      if (nextToken) {
        localStorage.setItem('token', nextToken)
        setToken(nextToken)
      } else {
        // Allow session/cookie based auth responses that don't return explicit API tokens.
        localStorage.removeItem('token')
        setToken('')
      }

      let nextUser = payload?.user
        || payload?.data?.user
        || payload?.profile
        || payload?.data?.profile
        || null

      // Some responses may include token first and user profile arrives via /api/me.
      if (!nextUser) {
        const meResponse = await fetch('/api/me', {
          credentials: 'include',
          headers: nextToken
            ? {
              Accept: 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
              Authorization: `Bearer ${nextToken}`,
            }
            : {
              Accept: 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
        })

        if (meResponse.ok) {
          nextUser = await meResponse.json()
        }
      }

      if (!nextToken && !nextUser) {
        const debugPreview = JSON.stringify(payload || {}).slice(0, 220)
        throw new Error(
          payload?.message
            || `Login response did not include token or user profile. Payload: ${debugPreview}`
        )
      }

      // Do not fail login UI if profile resolution is delayed.
      if (nextUser) {
        setUser(nextUser)
        setSuccess(`Welcome, ${nextUser.name || nextUser.email || 'User'}`)
      } else {
        setSuccess('Login successful. Loading your profile...')
      }
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleLogout = async () => {
    try {
      await apiRequest('/api/logout', { method: 'POST' })
    } catch {
      // logout should continue even if token already invalid
    }
    localStorage.removeItem('token')
    setToken('')
    setUser(null)
    setFavorites([])
    setBookings([])
    setPaymentMethodByBooking({})
  }

  const toggleFavorite = async (propertyId) => {
    if (!user || user.role !== 'guest') return

    try {
      if (favoriteIds.has(propertyId)) {
        await apiRequest(`/api/favorites/${propertyId}`, { method: 'DELETE' })
      } else {
        await apiRequest('/api/favorites', {
          method: 'POST',
          body: JSON.stringify({ property_id: propertyId }),
        })
      }
      const updated = await apiRequest('/api/favorites')
      setFavorites(updated)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const startEditProperty = (property) => {
    setEditingPropertyId(property.id)
    setPropertyForm({
      ...property,
    })
  }

  const resetAdminForm = () => {
    setEditingPropertyId(null)
    setPropertyForm(initialPropertyForm)
    setPropertyImageFile(null)
  }

  const submitProperty = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const method = editingPropertyId ? 'PUT' : 'POST'
    const endpoint = editingPropertyId
      ? `/api/properties/${editingPropertyId}`
      : '/api/properties'

    try {
      await apiRequest(endpoint, {
        method,
        body: JSON.stringify({
          ...propertyForm,
          stars: Number(propertyForm.stars),
          rating: Number(propertyForm.rating),
          reviews_count: Number(propertyForm.reviews_count),
          price_per_night: Number(propertyForm.price_per_night),
          max_guests: Number(propertyForm.max_guests),
          room_size_sqm: Number(propertyForm.room_size_sqm),
          free_cancellation: Boolean(propertyForm.free_cancellation),
          breakfast_included: Boolean(propertyForm.breakfast_included),
          pet_friendly: Boolean(propertyForm.pet_friendly),
          wifi_included: Boolean(propertyForm.wifi_included),
          parking_included: Boolean(propertyForm.parking_included),
        }),
      })
      setSuccess(editingPropertyId ? 'Property updated.' : 'Property created.')
      resetAdminForm()
      const refreshed = await apiRequest(`/api/properties?${queryString}`)
      setProperties(refreshed)
      if (user?.role === 'admin') {
        const payload = await apiRequest('/api/admin/analytics')
        setAnalytics(payload)
      }
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const uploadPropertyImage = async () => {
    if (!editingPropertyId || !propertyImageFile) return

    const formData = new FormData()
    formData.append('image', propertyImageFile)

    try {
      await apiRequest(`/api/properties/${editingPropertyId}/image`, {
        method: 'POST',
        body: formData,
      })
      setSuccess('Property image uploaded.')
      const refreshed = await apiRequest(`/api/properties?${queryString}`)
      setProperties(refreshed)
      setPropertyImageFile(null)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const deleteProperty = async (propertyId) => {
    try {
      await apiRequest(`/api/properties/${propertyId}`, { method: 'DELETE' })
      setProperties((prev) => prev.filter((p) => p.id !== propertyId))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const renderAuthForm = () => (
    <>
      <h2>Login / Register</h2>
      <form onSubmit={handleAuthSubmit} className="booking-form">
        {authMode === 'register' && (
          <input
            required
            placeholder="Name"
            value={authForm.name}
            onChange={(e) => setAuthForm((prev) => ({ ...prev, name: e.target.value }))}
          />
        )}
        <input
          required
          type="email"
          placeholder="Email"
          value={authForm.email}
          onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={authForm.password}
          onChange={(e) =>
            setAuthForm((prev) => ({ ...prev, password: e.target.value }))
          }
        />
        <button type="submit">
          {authMode === 'register' ? 'Create guest account' : 'Login'}
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'))}
        >
          Switch to {authMode === 'login' ? 'register' : 'login'}
        </button>
      </form>
      <p className="hint">Admin accounts are controlled by backend seeders/admins.</p>
    </>
  )

  const renderReservationPanel = () => (
    <section className="reservation-panel">
      <h3>My reservations and payments</h3>
      {bookings.length === 0 && <p className="hint">No reservations yet.</p>}
      {bookings.length > 0 && (
        <ul className="reservation-list">
          {bookings.map((item) => {
            const isPaid = item.payment_status === 'paid'

            return (
              <li key={item.id} className="reservation-item">
                <div className="reservation-head">
                  <strong>{item.property?.title}</strong>
                  <span className={`payment-badge ${isPaid ? 'paid' : 'unpaid'}`}>
                    {isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
                <small>
                  {formatStayDate(item.check_in)} to {formatStayDate(item.check_out)} • ${item.total_price}
                </small>
                {isPaid ? (
                  <small>
                    {formatPaymentMethod(item.payment_method)}
                    {item.paid_at ? ` • Paid at ${new Date(item.paid_at).toLocaleDateString()}` : ''}
                  </small>
                ) : (
                  <div className="pay-controls">
                    <select
                      value={paymentMethodByBooking[item.id] || 'credit_card'}
                      onChange={(e) =>
                        setPaymentMethodByBooking((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                    >
                      {paymentMethodOptions.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => payBooking(item.id)}
                    >
                      Pay now
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )

  const renderFavoritesPanel = () => (
    <>
      <h3>Your favorites</h3>
      <ul className="compact-list">
        {favorites.map((item) => (
          <li key={item.id}>{item.property?.title}</li>
        ))}
      </ul>
    </>
  )

  const renderAdminSidebar = () => (
    <>
      <h2>Admin panel: manage rooms</h2>
      {analytics && (
        <div className="admin-kpis">
          <p>Properties: {analytics.total_properties}</p>
          <p>Bookings: {analytics.total_bookings}</p>
          <p>Revenue: ${analytics.confirmed_revenue}</p>
          <p>Active guests: {analytics.active_guests}</p>
        </div>
      )}
      <form onSubmit={submitProperty} className="booking-form">
        <input
          required
          placeholder="Title"
          value={propertyForm.title}
          onChange={(e) => setPropertyForm((prev) => ({ ...prev, title: e.target.value }))}
        />
        <input
          required
          placeholder="Location"
          value={propertyForm.location}
          onChange={(e) =>
            setPropertyForm((prev) => ({ ...prev, location: e.target.value }))
          }
        />
        <select
          value={propertyForm.type}
          onChange={(e) => setPropertyForm((prev) => ({ ...prev, type: e.target.value }))}
        >
          <option value="Hotel">Hotel</option>
          <option value="Airbnb">Airbnb</option>
        </select>
        <input
          required
          placeholder="Image URL"
          value={propertyForm.image_url}
          onChange={(e) =>
            setPropertyForm((prev) => ({ ...prev, image_url: e.target.value }))
          }
        />
        <textarea
          required
          placeholder="Description"
          value={propertyForm.description}
          onChange={(e) =>
            setPropertyForm((prev) => ({ ...prev, description: e.target.value }))
          }
        />
        <input
          type="number"
          min="1"
          max="5"
          value={propertyForm.stars}
          onChange={(e) => setPropertyForm((prev) => ({ ...prev, stars: e.target.value }))}
          placeholder="Stars"
        />
        <input
          type="number"
          min="1"
          max="10"
          step="0.1"
          value={propertyForm.rating}
          onChange={(e) => setPropertyForm((prev) => ({ ...prev, rating: e.target.value }))}
          placeholder="Rating"
        />
        <input
          type="number"
          min="0"
          value={propertyForm.reviews_count}
          onChange={(e) =>
            setPropertyForm((prev) => ({ ...prev, reviews_count: e.target.value }))
          }
          placeholder="Reviews count"
        />
        <input
          type="number"
          min="1"
          value={propertyForm.price_per_night}
          onChange={(e) =>
            setPropertyForm((prev) => ({ ...prev, price_per_night: e.target.value }))
          }
          placeholder="Price per night"
        />
        <input
          type="number"
          min="1"
          value={propertyForm.max_guests}
          onChange={(e) =>
            setPropertyForm((prev) => ({ ...prev, max_guests: e.target.value }))
          }
          placeholder="Max guests"
        />
        <input
          type="number"
          min="10"
          max="250"
          value={propertyForm.room_size_sqm}
          onChange={(e) =>
            setPropertyForm((prev) => ({ ...prev, room_size_sqm: e.target.value }))
          }
          placeholder="Room size (sqm)"
        />
        <input
          value={propertyForm.bed_type}
          onChange={(e) => setPropertyForm((prev) => ({ ...prev, bed_type: e.target.value }))}
          placeholder="Bed type"
        />
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={Boolean(propertyForm.free_cancellation)}
            onChange={(e) =>
              setPropertyForm((prev) => ({ ...prev, free_cancellation: e.target.checked }))
            }
          />
          Free cancellation
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={Boolean(propertyForm.breakfast_included)}
            onChange={(e) =>
              setPropertyForm((prev) => ({ ...prev, breakfast_included: e.target.checked }))
            }
          />
          Breakfast included
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={Boolean(propertyForm.pet_friendly)}
            onChange={(e) =>
              setPropertyForm((prev) => ({ ...prev, pet_friendly: e.target.checked }))
            }
          />
          Pet friendly
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={Boolean(propertyForm.wifi_included)}
            onChange={(e) =>
              setPropertyForm((prev) => ({ ...prev, wifi_included: e.target.checked }))
            }
          />
          Wi-Fi included
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={Boolean(propertyForm.parking_included)}
            onChange={(e) =>
              setPropertyForm((prev) => ({ ...prev, parking_included: e.target.checked }))
            }
          />
          Parking included
        </label>
        <button type="submit">{editingPropertyId ? 'Update room' : 'Create room'}</button>
        {editingPropertyId && (
          <button type="button" className="secondary" onClick={resetAdminForm}>
            Cancel edit
          </button>
        )}
      </form>
      {editingPropertyId && (
        <div className="booking-form">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPropertyImageFile(e.target.files?.[0] || null)}
          />
          <button
            type="button"
            className="secondary"
            onClick={uploadPropertyImage}
            disabled={!propertyImageFile}
          >
            Upload selected image
          </button>
        </div>
      )}
      {analytics?.top_properties?.length > 0 && (
        <>
          <h3>Top booked properties</h3>
          <ul className="compact-list">
            {analytics.top_properties.map((item) => (
              <li key={item.id}>
                {item.title} ({item.bookings_count} bookings)
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )

  const renderGlobalStatus = () => (
    <>
      {success && <p className="status success">{success}</p>}
      {error && <p className="status error">{error}</p>}
    </>
  )

  const renderGuestDashboard = () => (
    <>
      <h2>Your travel dashboard</h2>
      <p className="hint">Open any room to book. Your reservations and payments appear here.</p>
      {renderFavoritesPanel()}
      {renderReservationPanel()}
    </>
  )

  const renderRoomDetailsPage = () => {
    const yesNo = (value, yesLabel, noLabel) => (value ? yesLabel : noLabel)

    return (
      <div className="page">
        <header className="hero">
          <div className="hero-content">
            <div className="room-top-row">
              <button type="button" className="back-button" onClick={returnToListing}>
                Back to all stays
              </button>
              <div className="top-actions">
                {!user ? (
                  <span>Preview room details without login. Login to reserve and pay.</span>
                ) : (
                  <span>
                    Signed in as {user.name} ({user.role})
                  </span>
                )}
                {user && <button onClick={handleLogout}>Logout</button>}
              </div>
            </div>
            <h1>Room details</h1>
          </div>
        </header>

        <main className="layout room-layout">
          <section className="results">
            {roomLoading && <p>Loading room details...</p>}
            {!roomLoading && !roomDetails && <p>Room not found.</p>}

            {roomDetails && (
              <article className="room-detail-card">
                <img src={roomDetails.image_url} alt={roomDetails.title} />
                <div className="room-detail-content">
                  <h2>{roomDetails.title}</h2>
                  <p className="meta">
                    {roomDetails.type} - {roomDetails.location}
                  </p>
                  <p>{roomDetails.description}</p>

                  <div className="room-spec-grid">
                    <div>
                      <strong>Price:</strong> ${roomDetails.price_per_night} / night
                    </div>
                    <div>
                      <strong>Guests:</strong> Up to {roomDetails.max_guests}
                    </div>
                    <div>
                      <strong>Rating:</strong> {roomDetails.rating} ({roomDetails.reviews_count} reviews)
                    </div>
                    <div>
                      <strong>Room size:</strong> {roomDetails.room_size_sqm} sqm
                    </div>
                    <div>
                      <strong>Bed type:</strong> {roomDetails.bed_type}
                    </div>
                    <div>
                      <strong>Stars:</strong> {'★'.repeat(roomDetails.stars)}
                    </div>
                  </div>

                  <h3>Room features</h3>
                  <div className="amenity-grid">
                    <span>{yesNo(roomDetails.breakfast_included, 'Breakfast included', 'Breakfast not included')}</span>
                    <span>{yesNo(roomDetails.pet_friendly, 'Pet friendly', 'Not pet friendly')}</span>
                    <span>{yesNo(roomDetails.wifi_included, 'Wi-Fi included', 'Wi-Fi not included')}</span>
                    <span>{yesNo(roomDetails.parking_included, 'Parking included', 'No parking')}</span>
                    <span>{yesNo(roomDetails.free_cancellation, 'Free cancellation', 'Non-refundable')}</span>
                  </div>
                </div>
              </article>
            )}

            {roomDetails && (
              <section className="availability-block">
                <h3>Availability (next 30 days)</h3>
                {availabilityLoading ? (
                  <p>Loading availability...</p>
                ) : (
                  <div className="availability-grid">
                    {availability.map((day) => (
                      <span
                        key={day.date}
                        className={`day-pill ${day.available ? 'free' : 'booked'}`}
                        title={day.date}
                      >
                        {day.date.slice(5)}
                      </span>
                    ))}
                  </div>
                )}
              </section>
            )}
          </section>

          <aside className="sidebar">
            {!user && renderAuthForm()}

            {user?.role === 'guest' && (
              <>
                <h2>Reserve this room</h2>
                {!roomDetails && <p>Select a room from the listing.</p>}

                {roomDetails && (
                  <>
                    <div className="selected">
                      <strong>{roomDetails.title}</strong>
                      <p>
                        {roomDetails.location} - Up to {roomDetails.max_guests} guests
                      </p>
                    </div>

                    <form onSubmit={handleBooking} className="booking-form">
                      <input
                        required
                        placeholder="Full name"
                        value={bookingForm.guest_name}
                        onChange={(e) =>
                          setBookingForm((prev) => ({ ...prev, guest_name: e.target.value }))
                        }
                      />
                      <input
                        required
                        type="email"
                        placeholder="Email"
                        value={bookingForm.guest_email}
                        onChange={(e) =>
                          setBookingForm((prev) => ({ ...prev, guest_email: e.target.value }))
                        }
                      />
                      <label>
                        Check-in
                        <input
                          required
                          type="date"
                          value={bookingForm.check_in}
                          onChange={(e) =>
                            setBookingForm((prev) => ({ ...prev, check_in: e.target.value }))
                          }
                        />
                      </label>
                      <label>
                        Check-out
                        <input
                          required
                          type="date"
                          value={bookingForm.check_out}
                          onChange={(e) =>
                            setBookingForm((prev) => ({ ...prev, check_out: e.target.value }))
                          }
                        />
                      </label>
                      <input
                        required
                        type="number"
                        min="1"
                        max={roomDetails.max_guests}
                        value={bookingForm.guests}
                        onChange={(e) =>
                          setBookingForm((prev) => ({ ...prev, guests: e.target.value }))
                        }
                      />
                      <button type="submit">Book now</button>
                    </form>
                  </>
                )}

                {renderFavoritesPanel()}
                {renderReservationPanel()}
              </>
            )}

            {user?.role === 'admin' && renderAdminSidebar()}
            {renderGlobalStatus()}
          </aside>
        </main>
      </div>
    )
  }

  if (activeRoomId) {
    return renderRoomDetailsPage()
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-content">
          <p className="eyebrow">Hotels - homes - airbnbs</p>
          <h1>Find your next stay</h1>
          <p className="subtitle">
            Browse 100 professional listings and open each room page for full amenities and booking info.
          </p>
          <div className="top-actions">
            {!user ? (
              <span>Open room pages without login. Login only when you want to reserve and pay.</span>
            ) : (
              <span>
                Signed in as {user.name} ({user.role})
              </span>
            )}
            {user && <button onClick={handleLogout}>Logout</button>}
          </div>

          <div className="search-bar">
            <input
              placeholder="Where are you going?"
              value={filters.location}
              onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
            />
            <input
              type="number"
              min="1"
              value={filters.guests}
              onChange={(e) => setFilters((prev) => ({ ...prev, guests: e.target.value }))}
              placeholder="Guests"
            />
            <input
              type="number"
              min="0"
              value={filters.min_price}
              onChange={(e) => setFilters((prev) => ({ ...prev, min_price: e.target.value }))}
              placeholder="Min $"
            />
            <input
              type="number"
              min="0"
              value={filters.max_price}
              onChange={(e) => setFilters((prev) => ({ ...prev, max_price: e.target.value }))}
              placeholder="Max $"
            />
          </div>
        </div>
      </header>

      <main className="layout">
        <section className="results">
          {loading && <p>Loading stays...</p>}
          {!loading && !error && (
            <p className="hint">{properties.length} stays available right now.</p>
          )}
          {error && <p className="status error">{error}</p>}
          {!loading && properties.length === 0 && <p>No properties match your search.</p>}

          {properties.map((property) => (
            <article
              key={property.id}
              className="card"
              onClick={() => openRoomDetails(property.id)}
            >
              <img src={property.image_url} alt={property.title} />
              <div className="card-body">
                <h3>{property.title}</h3>
                <p className="meta">
                  {property.type} - {property.location}
                </p>
                <p>{property.description}</p>
                <div className="row">
                  <span>{'★'.repeat(property.stars)}</span>
                  <strong>${property.price_per_night}/night</strong>
                </div>
                <small>
                  Rating {property.rating} ({property.reviews_count} reviews)
                </small>
                <div className="amenity-inline">
                  <span>{property.breakfast_included ? 'Breakfast included' : 'No breakfast'}</span>
                  <span>{property.pet_friendly ? 'Pet friendly' : 'No pets'}</span>
                </div>
                {user?.role === 'guest' && (
                  <button
                    className="favorite-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(property.id)
                    }}
                  >
                    {favoriteIds.has(property.id) ? 'Remove favorite' : 'Add to favorites'}
                  </button>
                )}
                {user?.role === 'admin' && (
                  <div className="admin-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        startEditProperty(property)
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="danger"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteProperty(property.id)
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>

        <aside className="sidebar">
          {!user && renderAuthForm()}
          {user?.role === 'guest' && renderGuestDashboard()}
          {user?.role === 'admin' && renderAdminSidebar()}
          {renderGlobalStatus()}
        </aside>
      </main>
    </div>
  )
}

export default App
