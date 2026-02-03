# Image Naming Convention

## File Structure
- One folder per series: `series-01/`, `series-02/`, etc.
- Series folders use zero-padded numbers (01-20+)

## Image File Naming
- Use contestant's full name in lowercase
- Replace spaces with hyphens
- Remove special characters (apostrophes, accents, etc.)
- Use appropriate extension (.jpg, .png, .webp)

## Examples
- "John Smith" → `john-smith.jpg`
- "Sarah O'Connor" → `sarah-oconnor.jpg`
- "José García" → `jose-garcia.jpg`
- "Tim Key" → `tim-key.png`
- "Aisling Bea" → `aisling-bea.png`

## Important Notes
- File names are for organization only
- Display order is controlled by `data/series.ts`
- Changing a filename requires updating the data file
- Images should be approximately 225x266 pixels (portrait ratio)

## Adding a New Series

1. **Create the folder:**
   ```bash
   mkdir -p public/images/series-XX
   ```
   Replace XX with zero-padded series number (01, 02, etc.)

2. **Add contestant images:**
   - Name files using the pattern: `firstname-lastname.ext`
   - Place all 5 contestant images in the folder

3. **Update data file:**
   - Open `data/series.ts`
   - Add a new series entry with contestant information
   - Use helper functions: `createContestantId()` and `getImageUrl()`

4. **Verify:**
   - Check that image URLs match actual filenames
   - Array order in data file determines display order
   - Test by selecting the series in the UI

## Current Structure

```
/public/images/
  /series-01/
    aisling-bea.png
    bob-mortimer.png
    mark-watson.png
    nish-kumar.png
    sally-phillips.png
  /series-02/
    (add images here)
  ...
```

## Tips

- Keep image file sizes reasonable (< 500KB each)
- Use consistent image dimensions across all contestants
- PNG supports transparency, JPG is smaller for photos
- Consider WebP format for better compression
