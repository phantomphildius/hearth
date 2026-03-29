import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LocationPicker from '../LocationPicker'

const defaultProps = {
  locationName: '',
  address: '',
  latitude: null,
  longitude: null,
  onChange: vi.fn(),
}

describe('LocationPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the location name input', () => {
    render(<LocationPicker {...defaultProps} />)
    expect(screen.getByLabelText('Location Name')).toBeInTheDocument()
  })

  it('renders the address input', () => {
    render(<LocationPicker {...defaultProps} />)
    expect(screen.getByLabelText('Address')).toBeInTheDocument()
  })

  it('calls onChange with updated location_name when location name input changes', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <LocationPicker
        {...defaultProps}
        onChange={handleChange}
      />
    )

    await user.type(screen.getByLabelText('Location Name'), 'Field #3')

    // onChange is called for each character; check the final character call
    expect(handleChange).toHaveBeenLastCalledWith({
      location_name: '3',
      address: '',
      latitude: null,
      longitude: null,
    })
  })

  it('calls onChange with updated address when address input changes', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <LocationPicker
        {...defaultProps}
        onChange={handleChange}
      />
    )

    await user.type(screen.getByLabelText('Address'), '123 Main St')

    expect(handleChange).toHaveBeenLastCalledWith({
      location_name: '',
      address: 't',
      latitude: null,
      longitude: null,
    })
  })

  it('"Use Current Location" button is present', () => {
    render(<LocationPicker {...defaultProps} />)
    expect(screen.getByRole('button', { name: /use current location/i })).toBeInTheDocument()
  })

  it('shows a success message after geolocation succeeds', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    // Mock navigator.geolocation
    const mockGetCurrentPosition = vi.fn((successCallback: PositionCallback) => {
      act(() => {
        successCallback({
          coords: {
            latitude: 39.7817,
            longitude: -89.6501,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        } as GeolocationPosition)
      })
    })

    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition: mockGetCurrentPosition },
      configurable: true,
    })

    render(
      <LocationPicker
        {...defaultProps}
        latitude={39.7817}
        longitude={-89.6501}
        onChange={handleChange}
      />
    )

    await user.click(screen.getByRole('button', { name: /use current location/i }))

    // The success message shows the coordinates
    expect(await screen.findByText(/location set/i)).toBeInTheDocument()
  })
})
