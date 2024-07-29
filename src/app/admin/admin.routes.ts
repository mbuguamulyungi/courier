import { Route } from '@angular/router';
import { ProfileComponent } from '@shared/components/profile/profile.component';

export const ADMIN_ROUTE: Route[] = [
    {
        path: 'dashboard',
        loadChildren: () =>
            import('./dashboard/dashboard.routes').then(
                (m) => m.DASHBOARD_ROUTE
            ),
    },
    {
        path: 'appointment',
        loadChildren: () =>
            import('./appointment/appointment.routes').then(
                (m) => m.APPOINTMENT_ROUTE
            ),
    },
    {
        path: 'deliveries',
        loadChildren: () =>
            import('./deliveries/deliveries.routes').then(
                (m) => m.DELIVERIES_ROUTE
            ),
    },
    {
        path: 'stages',
        loadChildren: () =>
            import('./stages/stages.routes').then(
                (m) => m.STAGES_ROUTE
            ),
    },
    {
        path: 'doctors',
        loadChildren: () =>
            import('./doctors/doctors.routes').then((m) => m.DOCTOR_ROUTE),
    },
    {
        path: 'staff',
        loadChildren: () =>
            import('./staff/staff.routes').then((m) => m.STAFF_ROUTE),
    },
    {
        path: 'patients',
        loadChildren: () =>
            import('./patients/patients.routes').then((m) => m.PATIENT_ROUTE),
    },
    {
        path: 'billing',
        loadChildren: () =>
            import('./billing/billing.routes').then((m) => m.BILLING_ROUTE),
    },
    {
        path: 'room',
        loadChildren: () =>
            import('./room/room.routes').then((m) => m.ROOMS_ROUTE),
    },
    {
        path: 'departments',
        loadChildren: () =>
            import('./departments/departments.routes').then(
                (m) => m.DEPARTMENT_ROUTE
            ),
    },
    {
        path: 'inventory',
        loadChildren: () =>
            import('./inventory/inventory.routes').then(
                (m) => m.INVENTORY_ROUTE
            ),
    },
    {
        path: 'records',
        loadChildren: () =>
            import('./records/records.routes').then((m) => m.RECORDS_ROUTE),
    },
    {
        path: 'ambulance',
        loadChildren: () =>
            import('./ambulance/ambulance.routes').then(
                (m) => m.AMBULANCE_ROUTE
            ),
    },
    {
        path: 'pharmacy',
        loadChildren: () =>
            import('./pharmacy/pharmacy.routes').then((m) => m.PHARMACY_ROUTE),
    },
    {
        path: 'profile',
        component: ProfileComponent,
    },
];
