# Chapter 3: Requirements and Analysis

## 3.1 Use Case Modeling

A Use Case Diagram was developed to model the functional requirements of the CeylonRoam system. It provides a high-level visual representation of the interactions between the system's primary actors and the core functionalities provided by the platform.

### 3.1.1 Primary Actors

The system identifies three primary human actors who interact with the platform, each with distinct roles and permissions:

1. **Tourist (User):** A traveller or local user seeking to plan trips, recognize locations, book travel packages, and interact with the AI assistant.
2. **Local Business Owner (Provider):** A service provider (hotel owner, tour guide, or vehicle provider) who uses the platform to list their services, manage packages, and handle customer bookings.
3. **System Admin:** The platform administrator responsible for overseeing user activity, approving business onboarding requests, managing global listings, and monitoring platform analytics.

### 3.1.2 Use Case Diagram

*Note: The following diagram is generated using Mermaid syntax. You can paste this code into an online Mermaid Live Editor or a markdown viewer to render the visual diagram.*

```mermaid
usecaseDiagram
    actor Tourist as "Tourist (User)"
    actor BusinessOwner as "Local Business Owner"
    actor Admin as "System Admin"

    rectangle "CeylonRoam Platform" {
        
        %% Shared Use Cases
        usecase UC_Auth as "Register / Login"
        usecase UC_Profile as "Manage Profile"
        
        %% Tourist Use Cases
        usecase UC_GenerateTrip as "Generate AI Trip Plan"
        usecase UC_ImageRec as "Upload Photo (Image Recognition)"
        usecase UC_Chatbot as "Chat with AI (Roamy)"
        usecase UC_Browse as "Search & Browse Packages"
        usecase UC_Book as "Book Package / Service"
        usecase UC_Payment as "Make PayPal Payment"
        usecase UC_Review as "Add / React to Reviews"
        usecase UC_SavePkg as "Save / Bookmark Packages"

        %% Business Owner Use Cases
        usecase UC_Onboard as "Submit Business Onboarding Request"
        usecase UC_ManagePkg as "Add / Edit / Delete Packages"
        usecase UC_ManageBookings as "Manage Customer Bookings"
        usecase UC_ProviderDash as "View Provider Earnings"

        %% Admin Use Cases
        usecase UC_ApproveBiz as "Approve / Reject Business Requests"
        usecase UC_ManageUsers as "Suspend / Delete Users"
        usecase UC_GlobalListings as "Manage Global Listings (Feature/Delete)"
        usecase UC_AdminDash as "View System Analytics & Revenue"

        %% Base actor connections
        Tourist --> UC_Auth
        Tourist --> UC_Profile
        Tourist --> UC_GenerateTrip
        Tourist --> UC_ImageRec
        Tourist --> UC_Chatbot
        Tourist --> UC_Browse
        Tourist --> UC_Book
        Tourist --> UC_Payment
        Tourist --> UC_Review
        Tourist --> UC_SavePkg

        BusinessOwner --> UC_Auth
        BusinessOwner --> UC_Profile
        BusinessOwner --> UC_Onboard
        BusinessOwner --> UC_ManagePkg
        BusinessOwner --> UC_ManageBookings
        BusinessOwner --> UC_ProviderDash

        Admin --> UC_Auth
        Admin --> UC_ApproveBiz
        Admin --> UC_ManageUsers
        Admin --> UC_GlobalListings
        Admin --> UC_AdminDash

        %% Includes / Extends Relationships
        UC_Book ..> UC_Payment : <<includes>>
        UC_GenerateTrip ..> UC_Auth : <<extends>> (if saving plan)
        UC_Review ..> UC_Auth : <<includes>>
    }
```

### 3.1.3 Core Use Case Descriptions

**Tourist (User) Actions:**
* **Generate AI Trip Plan:** The user inputs travel constraints (budget, dates, interests) to receive a hybrid AI-generated itinerary mapped directly to Sri Lankan geography.
* **Upload Photo (Image Recognition):** The user uploads a travel photo, and the system utilizes a fine-tuned CLIP model to identify the Sri Lankan tourist destination.
* **Chat with AI:** The user engages with "Roamy", a context-aware travel chatbot expert powered by Gemini AI.
* **Book Package & Make Payment:** The user selects a tour or service and confirms the reservation via the secure PayPal checkout gateway.
* **Add / React to Reviews:** The user shares their experience by leaving a star rating and comment, and can 'like' or 'dislike' community reviews.

**Local Business Owner Actions:**
* **Submit Business Onboarding Request:** The provider uploads verification documents (NIC, vehicle registration, tourism board licenses) to apply for a verified business account.
* **Manage Packages:** The provider has full CRUD (Create, Read, Update, Delete) access to list their hotels, vehicles, or guided tours.
* **Manage Customer Bookings:** The provider views incoming reservations and updates the lifecycle status (Pending → Confirmed → Completed) of customer bookings.

**System Admin Actions:**
* **Approve / Reject Business Requests:** The admin reviews uploaded credentials and activates pending business provider accounts.
* **Suspend / Delete Users:** The admin maintains platform integrity by suspending malicious accounts or executing a cascade deletion of user data.
* **View System Analytics:** The admin accesses dynamic Recharts-powered dashboards detailing monthly revenue, booking volumes, and platform traffic.
