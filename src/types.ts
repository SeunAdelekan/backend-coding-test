export interface RideRequest {
    start_lat: number,
    start_long: number,
    end_lat: number,
    end_long: number,
    rider_name: string,
    driver_name: string,
    driver_vehicle: string
}
