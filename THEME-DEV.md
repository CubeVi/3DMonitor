# Pages

- **Main window** — `src/view/main/index.vue`
  1. Displays the theme preview cover and description.
  2. Downloads and applies a theme to the C1. Themes are stored in `C:\Users\{your account}\AppData\Roaming\3DMonitor\themes\`.

- **Secondary screen window** — `src/view/dynamicmain/index.vue`
  The secondary screen renders content dynamically. Each component is positioned with absolute CSS positioning to produce the final layout.

# Components

A theme is composed of 6 custom components and 2 native elements (`image` and `mask`). All elements use absolute positioning, controlled via the CSS `top` and `left` properties.

1. **Circular progress bar** — `src/components/ClockProgress/index.vue`
   Displays a circular progress ring with a numeric label. Supports: size, bar color, bar width percentage, text color, text vertical offset, line cap style, and background color.

   ```json
   {
     "type": "circle",
     "category": "cpu-circle-usage",
     "style": {
       "position": "absolute",
       "left": "358px",
       "top": "510px"
     },
     "innerStyle": {
       "size": "439px",
       "stokeWidth": "40px",
       "stroke-color": "white",
       "color": "#FE301A",
       "fontSize": "137px",
       "stroke-linecap": "butt",
       "hide-inactive": "1",
       "background-color": "transparent",
       "textColor": "white",
       "textOffsetY": "60%"
     }
   }
   ```

2. **Horizontal progress bar** — `src/components/HorizontalProgress/index.vue`
   Supports bar color, background color, and border-radius customization.

   ```json
   {
     "type": "rect",
     "category": "cpu-rect-clock",
     "style": {
       "position": "absolute",
       "left": "815px",
       "top": "719px",
       "width": "277px",
       "height": "17px",
       "border-radius": "15px"
     },
     "innerStyle": {
       "color": "#80FF50",
       "bgColor": "transparent",
       "border-radius": "15px"
     }
   }
   ```

3. **Vertical progress bar** — `src/components/VerticalProgress/index.vue`
   Supports bar color, background color, and border-radius customization.

   ```json
   {
     "type": "vertical",
     "category": "ram-rect-v-used",
     "style": {
       "position": "absolute",
       "left": "500px",
       "top": "719px",
       "width": "17px",
       "height": "143px",
       "border-radius": "15px"
     },
     "innerStyle": {
       "color": "#80FF50",
       "bgColor": "transparent",
       "border-radius": "15px"
     }
   }
   ```

4. **Static text** — `src/components/NormalText/index.vue`
   A general-purpose text element that supports all CSS properties applicable to a `<span>`. Does not require a `category` field.

   ```json
   {
     "type": "text",
     "content": "TEMP",
     "style": {
       "position": "absolute",
       "left": "159px",
       "top": "574px",
       "font-family": "dinBold, sans-serif",
       "font-size": "60px",
       "color": "#80FF50",
       "font-weight": "500"
     }
   }
   ```

5. **Data text** — `src/components/DataText/index.vue`
   Displays a live hardware metric as text. Supports all CSS properties applicable to a `<span>`. Requires a `category` field to specify which data to display.

   ```json
   {
     "type": "data",
     "category": "cpu-data-temp",
     "style": {
       "position": "absolute",
       "left": "159px",
       "top": "636px",
       "text-align": "right",
       "width": "150px",
       "font-family": "dinBold, sans-serif",
       "font-size": "60px",
       "color": "#80FF50",
       "font-weight": "500"
     }
   }
   ```

6. **Image** — native `<img>` element.
   Does not require a `category` field. The `src` value is computed at runtime as the base64-encoded content of the image file.

   ```json
   {
     "type": "image",
     "name": "p_cpu_circle_bg.png",
     "src": "",
     "style": {
       "position": "absolute",
       "width": "550px",
       "height": "484px",
       "left": "294px",
       "top": "491px",
       "object-fit": "cover"
     }
   }
   ```

7. **Mask overlay** — native `<div>` element.
   Does not require a `category` field. Supports background color customization. Defaults to full-screen coverage.

   ```json
   {
     "type": "mask",
     "style": {
       "position": "absolute",
       "width": "100%",
       "height": "100%",
       "left": "0px",
       "top": "0px",
       "background-color": "rgba(15,44,60,0.6)"
     }
   }
   ```

8. **Multi-view video** — `src/view/viewer/index_babylon.vue`
   Renders a lenticular-interlaced video for glasses-free 3D depth (pop-out effect). The `src` value is computed at runtime as `file://${fileDir + '/' + name}`.

   ```json
   {
     "type": "video",
     "name": "eva.mp4",
     "src": "",
     "style": {
       "position": "absolute",
       "width": "100%",
       "height": "100%",
       "left": "0px",
       "top": "0px"
     }
   }
   ```

# Data Configuration

## Theme Structure

A theme consists of one `data.json` file plus any number of image or video files (single-frame multi-view videos). For example, the file listing for a typical theme looks like this:

```text
Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         2024/8/22     21:05           9606 data.json
-a----         2024/8/20     16:27        1350255 p_background.mp4
-a----         2024/8/20      8:08          39841 p_cpu_circle_bg1.png
-a----         2024/8/20      8:08           9601 p_disk_circle_bg1.png
-a----         2024/8/20      8:08          30565 p_gpu_circle_bg1.png
-a----         2024/8/20     20:51          70414 p_img_slogn.png
-a----         2024/8/20      8:08          12223 p_ram_circle_bg1.png
```

The top-level structure of `data.json` is:

```json
{
  "id": "10087",                       // Theme ID — reserved, not used yet
  "name": "CyberPunkC1",               // Theme name — reserved, not used yet
  "description": "CyberPunkC1 Theme",  // Theme description — reserved, not used yet
  "cover": "",                         // Cover image — reserved, not used yet
  "list": []                           // Component descriptor array — active
}
```

## Component Descriptor Schema

Each entry in `list` follows this schema:

```json
{
  "type": "string",        // Component type — one of the 8 types above
  "category": "string",   // Data key — hardware name, usage, temperature, frequency, etc.
  "content": "string",    // Static text content — only used when type is "text"
  "style": {},            // Standard CSS properties applied directly to the element
  "innerStyle": {}        // Component-specific properties, transformed internally before being applied to the child element
}
```

## Category Reference

The `category` naming convention is: `hardware-type` + `component-type` + `hardware-attribute`.

### CPU

```text
cpu-data-model    // CPU model name       — data text component
cpu-data-temp     // CPU temperature      — data text component
cpu-data-clock    // CPU clock speed      — data text component
cpu-data-usage    // CPU usage            — data text component
cpu-circle-usage  // CPU usage            — circular progress component
cpu-circle-clock  // CPU clock speed      — circular progress component
cpu-circle-temp   // CPU temperature      — circular progress component
cpu-rect-usage    // CPU usage            — horizontal progress bar component
cpu-rect-clock    // CPU clock speed      — horizontal progress bar component
cpu-rect-temp     // CPU temperature      — horizontal progress bar component
cpu-rect-v-usage  // CPU usage            — vertical progress bar component
cpu-rect-v-clock  // CPU clock speed      — vertical progress bar component
cpu-rect-v-temp   // CPU temperature      — vertical progress bar component
```

### GPU

```text
gpu-data-model    // GPU model name       — data text component
gpu-data-temp     // GPU temperature      — data text component
gpu-data-clock    // GPU clock speed      — data text component
gpu-data-usage    // GPU usage            — data text component
gpu-circle-usage  // GPU usage            — circular progress component
gpu-circle-clock  // GPU clock speed      — circular progress component
gpu-circle-temp   // GPU temperature      — circular progress component
gpu-rect-usage    // GPU usage            — horizontal progress bar component
gpu-rect-clock    // GPU clock speed      — horizontal progress bar component
gpu-rect-temp     // GPU temperature      — horizontal progress bar component
gpu-rect-v-usage  // GPU usage            — vertical progress bar component
gpu-rect-v-clock  // GPU clock speed      — vertical progress bar component
gpu-rect-v-temp   // GPU temperature      — vertical progress bar component
```

### Memory

```text
mem-data-free     // Available memory     — data text component
mem-data-used     // Used memory          — data text component
mem-circle-free   // Available memory     — circular progress component
mem-circle-used   // Used memory          — circular progress component
mem-rect-free     // Available memory     — horizontal progress bar component
mem-rect-used     // Used memory          — horizontal progress bar component
mem-rect-v-free   // Available memory     — vertical progress bar component
mem-rect-v-usage  // Used memory          — vertical progress bar component
```

### Disk

```text
disk-data-free    // C: drive free space  — data text component
disk-data-used    // C: drive used space  — data text component
disk-circle-free  // C: drive free space  — circular progress component
disk-circle-used  // C: drive used space  — circular progress component
disk-rect-free    // C: drive free space  — horizontal progress bar component
disk-rect-used    // C: drive used space  — horizontal progress bar component
disk-rect-v-free  // C: drive free space  — vertical progress bar component
disk-rect-v-usage // C: drive used space  — vertical progress bar component
```

### Network

Network metrics are currently available as data text only.

```text
upstream-data     // Upload speed
downstream-data   // Download speed
```
