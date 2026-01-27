# Learning Hall - Product Vision

**Version:** 1.0.0
**Last Updated:** January 2026

---

## Executive Summary

Learning Hall will evolve from an LMS clone into a **self-hostable, white-label course creation platform** that anyone can deploy with their own storage backends. The key differentiator: **Bring Your Own Storage (BYOS)** - users connect their own AWS S3, Google Cloud Storage, local filesystem, or other storage providers to host their content.

### Target Users
- Solo educators and content creators
- Developers wanting to add courses to their portfolio
- Small businesses offering training
- Anyone who wants full control over their course content and data

### Core Value Proposition
> "Your courses. Your storage. Your brand. Zero vendor lock-in."

---

## Market Research Summary

### What Modern LMS Platforms Offer (2025-2026)

Based on research from [360Learning](https://360learning.com/blog/learning-management-system-examples/), [Docebo](https://www.docebo.com/learning-network/blog/best-learning-management-system/), and [LearnWorlds](https://www.learnworlds.com/best-learning-management-systems/):

| Feature Category | Must-Have | Nice-to-Have |
|-----------------|-----------|--------------|
| **Content** | Video, text, PDF, quizzes | SCORM, xAPI, interactive video |
| **Engagement** | Progress tracking, certificates | Gamification, leaderboards, badges |
| **Delivery** | Responsive design, mobile | Native mobile app, offline access |
| **Analytics** | Completion rates, time spent | AI-powered insights, skill mapping |
| **Monetization** | Payment processing | Subscriptions, bundles, coupons |
| **Personalization** | Learning paths | AI recommendations |

### Self-Hosted Platform Advantages

From [Paradiso Solutions](https://www.paradisosolutions.com/blog/best-self-hosted-lms/) and [iSpring](https://www.ispringsolutions.com/blog/hosted-lms):

- **Data ownership**: Full control over sensitive content
- **Customization**: Complete backend access for developers
- **No vendor lock-in**: Own your content forever
- **Cost control**: No per-user fees or revenue sharing
- **Privacy compliance**: Meet GDPR, HIPAA requirements

### What Solo Creators Actually Need

From [Podia](https://www.podia.com/articles/best-online-course-platforms) and [LinoDash](https://linodash.com/online-course-platforms/):

1. **Simplicity** - No-code course builder
2. **Low/No transaction fees** - Keep 100% of sales
3. **All-in-one** - Don't need 10 different tools
4. **Quick setup** - Launch in hours, not weeks
5. **Affordable** - Not $300/month enterprise pricing

---

## Feature Roadmap

### Phase 1: Core Platform (Current + Near-term)

#### 1.1 Fix Existing Functionality
- [ ] Remove debug code (`sleep(1)`, console logs)
- [ ] Uncomment Task model associations
- [ ] Add proper authorization (role-based access)
- [ ] Fix database naming inconsistency

#### 1.2 Enrollment System
```
User enrolls in Course → Creates Enrollment record
Enrollment tracks: progress, started_at, completed_at
```

| Feature | Description |
|---------|-------------|
| Course enrollment | Users can enroll in courses |
| Progress tracking | Track completion per course |
| My Courses dashboard | View enrolled courses |
| Completion certificates | Generate PDF certificates |

#### 1.3 Content Improvements
- [ ] Task/lesson ordering (drag-and-drop)
- [ ] Rich text editor (TipTap or similar)
- [ ] Better markdown preview
- [ ] Code syntax highlighting

---

### Phase 2: Bring Your Own Storage (BYOS)

This is the **key differentiator**. Based on research from [Iconik](https://www.iconik.io/faqs) and [Camio BYOS](https://camio.com/solutions/byos):

#### 2.1 Storage Provider Interface

```typescript
interface StorageProvider {
  name: string;
  upload(file: File, path: string): Promise<string>;
  download(path: string): Promise<Blob>;
  delete(path: string): Promise<void>;
  getSignedUrl(path: string, expiresIn: number): Promise<string>;
  list(prefix: string): Promise<string[]>;
}
```

#### 2.2 Supported Providers (Priority Order)

| Provider | Priority | Use Case |
|----------|----------|----------|
| **Local Filesystem** | P0 | Development, simple deployments |
| **AWS S3** | P0 | Most common cloud storage |
| **Cloudflare R2** | P1 | S3-compatible, no egress fees |
| **Google Cloud Storage** | P1 | GCP users |
| **Backblaze B2** | P2 | Budget-friendly S3 alternative |
| **MinIO** | P2 | Self-hosted S3-compatible |

#### 2.3 User Configuration Flow

```
1. User creates account
2. User goes to Settings → Storage
3. User selects provider (S3, GCS, Local, etc.)
4. User enters credentials (access key, secret, bucket)
5. System validates connection
6. All uploads go to user's storage
```

#### 2.4 Database Schema Addition

```ruby
# storage_configurations table
create_table :storage_configurations do |t|
  t.references :user, null: false, foreign_key: true
  t.string :provider, null: false  # 's3', 'gcs', 'local', 'r2'
  t.text :credentials_encrypted     # Encrypted JSON
  t.string :bucket_name
  t.string :region
  t.string :endpoint               # For S3-compatible services
  t.boolean :active, default: true
  t.timestamps
end
```

---

### Phase 3: Video Support

Based on research from [self-hosted HLS platforms](https://github.com/lucasfhs/streaming-hls-website) and [Dacast](https://www.dacast.com/blog/hls-streaming-protocol/):

#### 3.1 Basic Video Upload
- [ ] Direct video upload to user's storage
- [ ] Video player component (Video.js or Plyr)
- [ ] Support common formats (MP4, WebM)

#### 3.2 Advanced Video Features (Later)
- [ ] HLS adaptive streaming (360p, 720p, 1080p)
- [ ] Video transcoding (FFmpeg integration)
- [ ] Thumbnail generation
- [ ] Video chapters/timestamps
- [ ] Playback speed control
- [ ] Resume playback position

#### 3.3 Video Processing Architecture

```
Upload Flow:
┌─────────┐    ┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  User   │───►│  Rails API  │───►│  Background  │───►│   User's    │
│ Upload  │    │  (receive)  │    │  Job (FFmpeg)│    │   Storage   │
└─────────┘    └─────────────┘    └──────────────┘    └─────────────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │ Create HLS   │
                                  │ Variants     │
                                  │ 360p/720p/   │
                                  │ 1080p        │
                                  └──────────────┘
```

---

### Phase 4: White-Label & Embeddable

Based on research from [LearnWorlds](https://www.learnworlds.com/white-label-schools/) and [Coursebox](https://www.coursebox.ai/white-label-lms):

#### 4.1 Branding Customization
- [ ] Custom logo upload
- [ ] Color theme customization
- [ ] Custom domain support
- [ ] Remove all "Learning Hall" branding

#### 4.2 Embeddable Course Player

```html
<!-- Embed a single course -->
<iframe
  src="https://your-domain.com/embed/course/123"
  width="100%"
  height="600"
></iframe>

<!-- Or use the JS widget -->
<div id="learning-hall-course" data-course-id="123"></div>
<script src="https://your-domain.com/embed.js"></script>
```

#### 4.3 Portfolio Integration
- [ ] Public course catalog page
- [ ] Shareable course links
- [ ] Course preview mode (no login required)
- [ ] Social sharing meta tags (Open Graph)

---

### Phase 5: Monetization (Optional)

#### 5.1 Payment Integration
- [ ] Stripe integration
- [ ] Course pricing
- [ ] Coupon codes
- [ ] Free vs paid courses

#### 5.2 Subscription Model
- [ ] Monthly/yearly subscriptions
- [ ] Access control based on subscription
- [ ] Bundle multiple courses

---

### Phase 6: Advanced Features

#### 6.1 AI-Powered Features
Based on [Thinkific](https://www.thinkific.com/features/courses/) and [Coursebox AI](https://www.coursebox.ai/blog/best-open-source-learning-management-systems):

- [ ] AI quiz generation from content
- [ ] Auto-generate video transcripts
- [ ] AI course outline suggestions
- [ ] Personalized learning recommendations

#### 6.2 Community Features
Based on [Circle](https://zanfia.com/blog/best-platform-for-course-creators/):

- [ ] Discussion forums per course
- [ ] Q&A on lessons
- [ ] Student-to-student interaction
- [ ] Live session scheduling

#### 6.3 Gamification
- [ ] Achievement badges
- [ ] Points system
- [ ] Leaderboards
- [ ] Streak tracking

---

## Technical Architecture

### Deployment Options

```
Option 1: Full Self-Hosted
┌─────────────────────────────────────────────────┐
│                 User's Server                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Rails   │  │ Postgres │  │ User's       │  │
│  │  API     │  │          │  │ Storage      │  │
│  └──────────┘  └──────────┘  │ (S3/Local)   │  │
│  ┌──────────┐               └──────────────┘  │
│  │  React   │                                   │
│  │  SPA     │                                   │
│  └──────────┘                                   │
└─────────────────────────────────────────────────┘

Option 2: Hybrid (SaaS + BYOS)
┌────────────────────┐         ┌────────────────────┐
│  Learning Hall     │         │  User's Storage    │
│  (Hosted Service)  │◄───────►│  (S3/GCS/R2)       │
│                    │         │                    │
│  - Auth            │         │  - Videos          │
│  - Course metadata │         │  - Documents       │
│  - Progress        │         │  - Images          │
└────────────────────┘         └────────────────────┘
```

### Docker Compose (Self-Hosted)

```yaml
version: '3.8'
services:
  web:
    image: learning-hall/api:latest
    environment:
      - DATABASE_URL=postgres://...
      - STORAGE_PROVIDER=s3  # or 'local', 'gcs', 'r2'
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_BUCKET=${AWS_BUCKET}
    ports:
      - "3000:3000"

  frontend:
    image: learning-hall/frontend:latest
    ports:
      - "80:80"

  db:
    image: postgres:16
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Optional: Local file storage
  storage:
    image: minio/minio
    command: server /data
    volumes:
      - minio_data:/data
```

---

## Competitive Positioning

| Feature | Teachable | Thinkific | Podia | **Learning Hall** |
|---------|-----------|-----------|-------|-------------------|
| Self-hosted | No | No | No | **Yes** |
| BYOS | No | No | No | **Yes** |
| Open source | No | No | No | **Yes** |
| Transaction fees | 5-10% | 0% | 0% | **0%** |
| White-label | Paid tier | Paid tier | No | **Free** |
| Video hosting | Included | Included | Included | **BYOS** |
| Starting price | $59/mo | $49/mo | $39/mo | **Free** |

### Unique Value Propositions

1. **Own Your Data**: Content lives in YOUR storage, not vendor's
2. **No Vendor Lock-in**: Export everything, switch anytime
3. **Zero Transaction Fees**: Keep 100% of your revenue
4. **True White-Label**: No "Powered by" anywhere
5. **Open Source**: Fork it, modify it, contribute back
6. **Portfolio-Ready**: Embed courses in your personal site

---

## Success Metrics

### Phase 1 Success
- [ ] Working enrollment system
- [ ] 10+ courses can be created without issues
- [ ] <3s page load times

### Phase 2 Success (BYOS)
- [ ] 3+ storage providers supported
- [ ] Users can upload videos to their own S3
- [ ] No data stored on Learning Hall servers

### Phase 3 Success (Video)
- [ ] HLS streaming works
- [ ] Mobile video playback works
- [ ] Transcoding completes in <5min for 10min video

### Long-term Success
- [ ] 100+ GitHub stars
- [ ] 10+ community contributions
- [ ] Featured in "awesome self-hosted" lists
- [ ] Used by 50+ course creators

---

## Next Steps (Recommended)

1. **Immediate**: Merge documentation PR, fix debug code
2. **Week 1-2**: Implement enrollment system
3. **Week 3-4**: Add task ordering and content improvements
4. **Month 2**: Build BYOS storage abstraction layer
5. **Month 3**: Video upload and basic playback
6. **Month 4+**: White-label features, embeddable player

---

## Sources

- [360Learning - LMS Examples](https://360learning.com/blog/learning-management-system-examples/)
- [Docebo - Best LMS](https://www.docebo.com/learning-network/blog/best-learning-management-system/)
- [LearnWorlds - White Label](https://www.learnworlds.com/white-label-schools/)
- [Podia - Best Platforms for Creators](https://www.podia.com/articles/best-online-course-platforms)
- [LinoDash - Online Course Platforms](https://linodash.com/online-course-platforms/)
- [Iconik - BYOS FAQ](https://www.iconik.io/faqs)
- [Camio - BYOS Solution](https://camio.com/solutions/byos)
- [Paradiso - Self-Hosted LMS](https://www.paradisosolutions.com/blog/best-self-hosted-lms/)
- [iSpring - Hosted LMS](https://www.ispringsolutions.com/blog/hosted-lms)
- [GitHub - HLS Streaming Platform](https://github.com/lucasfhs/streaming-hls-website)
- [Dacast - HLS Streaming](https://www.dacast.com/blog/hls-streaming-protocol/)
- [Coursebox - White Label LMS](https://www.coursebox.ai/white-label-lms)
- [Thinkific - Course Features](https://www.thinkific.com/features/courses/)
