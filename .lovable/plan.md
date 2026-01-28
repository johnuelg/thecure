

# Data Analytics Showcase CMS Implementation

## Overview

Add a new "Data Visualizations" section to the Admin CMS that allows you to create, edit, and manage medical data visualization demos. Each visualization can include animated GIFs, static images, embedded charts, or even custom interactive visualizations using D3.js/JavaScript snippets.

---

## What You'll Be Able to Do

- **Create visualization demos**: Add new healthcare data visualizations with titles, descriptions, and visual content
- **Upload GIF animations**: Showcase animated D3.js visualizations as GIFs or videos
- **Manage chart data**: Store JSON data for dynamic Recharts-based visualizations
- **Control visibility**: Toggle which visualizations appear on the public site
- **Reorder displays**: Set the order of visualizations in the showcase grid

---

## Implementation Approach

### Visualization Types Supported

1. **Image/GIF**: Upload animated GIFs of D3.js visualizations
2. **Static Image**: Screenshots or diagrams of data analysis
3. **Embedded JSON Charts**: Dynamic Recharts visualizations with editable data
4. **Embed URL**: External visualization links (Observable, Tableau, etc.)

---

## Technical Implementation

### Phase 1: Database Setup

Create a new `data_visualizations` table:

```
Columns:
- id (UUID, primary key)
- title (text, required) - e.g., "Patient Recovery Rates"
- description (text) - Brief explanation of the visualization
- visualization_type (text) - 'image', 'gif', 'chart', 'embed'
- chart_type (text, nullable) - 'line', 'bar', 'pie', 'area' for Recharts
- chart_data (JSONB, nullable) - Data for dynamic charts
- media_url (text, nullable) - URL for GIF/image/embed
- chart_config (JSONB, nullable) - Styling and axis configuration
- is_active (boolean, default true) - Show/hide on public site
- display_order (integer, default 0) - Sort order
- created_at, updated_at (timestamps)
```

RLS Policies:
- Anyone can view active visualizations
- Admins can perform all CRUD operations

### Phase 2: Admin CMS Page

Create `VisualizationsManager.tsx` with:

1. **List View**: Grid display of all visualizations with preview thumbnails
2. **Add/Edit Dialog**:
   - Title and description fields
   - Visualization type selector (Image/GIF, Chart, Embed)
   - Conditional fields based on type:
     - **Image/GIF**: Media URL input + preview
     - **Chart**: Chart type dropdown + JSON data editor + preview
     - **Embed**: URL input for external visualizations
   - Active toggle and display order

3. **Features**:
   - Live preview of charts when editing JSON data
   - Image URL preview
   - Drag-and-drop reordering (future enhancement)

### Phase 3: Update Admin Navigation

Add "Visualizations" to the sidebar in `AdminLayout.tsx`:
- Icon: BarChart3 from Lucide
- Route: `/admin/visualizations`

### Phase 4: Update Public Section

Modify `DataVisualizationSection.tsx` to:
- Fetch visualizations from the database
- Render different visualization types dynamically
- Fall back to default charts if no data exists
- Support both database-driven and static demo charts

---

## File Changes Summary

| File | Action |
|------|--------|
| New migration | Create `data_visualizations` table with RLS |
| `src/pages/admin/VisualizationsManager.tsx` | New - CMS management page |
| `src/components/admin/AdminLayout.tsx` | Update - Add navigation item |
| `src/App.tsx` | Update - Add route |
| `src/components/sections/DataVisualizationSection.tsx` | Update - Fetch from database |

---

## About D3.js and GIF Visualizations

Since Lovable is built on React and doesn't support raw D3.js scripts directly in the CMS, here's how to add D3.js animations:

1. **Create D3.js visualizations locally** using your preferred development environment
2. **Record as GIF or video** using tools like ScreenToGif, Gifox, or LICEcap
3. **Upload the GIF** to Supabase Storage (portfolio-images bucket)
4. **Add to CMS** using the media URL

For interactive visualizations, you could:
- Use the built-in Recharts integration with custom JSON data
- Embed external visualizations from Observable, CodePen, or Tableau
- Create React components that wrap D3.js (requires code changes)

---

## Sample Visualization Data Structure

```json
{
  "title": "AI Diagnostic Accuracy",
  "description": "Monthly accuracy improvements in AI-assisted diagnostics",
  "visualization_type": "chart",
  "chart_type": "line",
  "chart_data": [
    { "month": "Jan", "accuracy": 78, "traditional": 65 },
    { "month": "Feb", "accuracy": 82, "traditional": 66 },
    { "month": "Mar", "accuracy": 87, "traditional": 67 }
  ],
  "chart_config": {
    "xAxisKey": "month",
    "lines": [
      { "dataKey": "accuracy", "name": "AI-Assisted", "color": "primary" },
      { "dataKey": "traditional", "name": "Traditional", "color": "muted" }
    ]
  }
}
```

---

## Next Steps After Approval

1. Create the database migration for `data_visualizations`
2. Build the `VisualizationsManager.tsx` admin page
3. Add navigation and routing
4. Update the public section to use database data
5. Test the complete flow

