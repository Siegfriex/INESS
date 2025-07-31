{
  "project": {
    "name": "마음로그 V2.2",
    "version": "2.2.1",
    "lastUpdated": "2025-07-26",
    "platform": "React Native",
    "designPhilosophy": "벚꽃의 성장 메타포를 통한 자기돌봄 여정",
    "performanceTargets": {
      "fps": 60,
      "animationBudget": "16ms",
      "batteryOptimized": true
    }
  },
  
  "designTokens": {
    "colors": {
      "blossom": {
        "50": "#FFF5F7",
        "100": "#FFE4E9",
        "300": "#FFC4D1",
        "500": "#FF8FA3",
        "700": "#E85D75"
      },
      "sky": {
        "100": "#E3F2FD",
        "300": "#90CAF9",
        "500": "#42A5F5"
      },
      "growth": {
        "100": "#E8F5E9",
        "300": "#A5D6A7",
        "500": "#66BB6A"
      },
      "earth": {
        "300": "#BCAAA4",
        "500": "#8D6E63"
      },
      "semantic": {
        "surface": {
          "primary": "#FFFFFF",
          "secondary": "#FAFAF8"
        },
        "text": {
          "primary": "#2C2825",
          "secondary": "#65605A"
        },
        "border": {
          "default": "#E5E0DA"
        }
      }
    },
    
    "typography": {
      "fontFamily": {
        "primary": "System",
        "accent": "Noto Sans KR"
      },
      "fontSize": {
        "xs": 12,
        "sm": 14,
        "base": 16,
        "lg": 18,
        "xl": 20,
        "2xl": 24,
        "3xl": 30
      },
      "fontWeight": {
        "regular": 400,
        "medium": 500,
        "semibold": 600,
        "bold": 700
      },
      "lineHeight": {
        "tight": 1.25,
        "normal": 1.5,
        "relaxed": 1.75
      }
    },
    
    "spacing": {
      "0": 0,
      "1": 4,
      "2": 8,
      "3": 12,
      "4": 16,
      "5": 20,
      "6": 24,
      "8": 32,
      "10": 40,
      "12": 48,
      "16": 64
    },
    
    "borderRadius": {
      "none": 0,
      "sm": 4,
      "base": 8,
      "lg": 12,
      "xl": 16,
      "full": 9999
    },
    
    "animations": {
      "duration": {
        "instant": 0,
        "fast": 100,
        "normal": 300,
        "slow": 500
      },
      "easing": {
        "default": "easeInOut",
        "smooth": "easeOut",
        "bounce": "easeInOutBack"
      }
    },
    
    "shadows": {
      "none": null,
      "sm": {
        "shadowColor": "#000",
        "shadowOffset": {"width": 0, "height": 1},
        "shadowOpacity": 0.05,
        "shadowRadius": 2,
        "elevation": 1
      },
      "base": {
        "shadowColor": "#000",
        "shadowOffset": {"width": 0, "height": 2},
        "shadowOpacity": 0.08,
        "shadowRadius": 4,
        "elevation": 2
      },
      "lg": {
        "shadowColor": "#000",
        "shadowOffset": {"width": 0, "height": 4},
        "shadowOpacity": 0.12,
        "shadowRadius": 8,
        "elevation": 4
      }
    }
  },
  
  "componentLibrary": {
    "baseComponents": {
      "BaseCard": {
        "variants": {
          "emotion": {
            "backgroundColor": "dynamic",
            "borderWidth": 0,
            "shadow": "base"
          },
          "expert": {
            "backgroundColor": "surface.primary",
            "borderWidth": 1,
            "borderColor": "border.default",
            "shadow": "base"
          },
          "insight": {
            "backgroundColor": "surface.secondary",
            "borderWidth": 0,
            "shadow": "sm"
          },
          "crisis": {
            "backgroundColor": "blossom.100",
            "borderWidth": 1,
            "borderColor": "blossom.300",
            "shadow": "none"
          }
        },
        "sharedProps": {
          "padding": "spacing.4",
          "borderRadius": "base",
          "overflow": "hidden"
        }
      },
      
      "ActionButton": {
        "variants": {
          "primary": {
            "backgroundColor": "blossom.500",
            "textColor": "white",
            "borderWidth": 0
          },
          "secondary": {
            "backgroundColor": "transparent",
            "textColor": "blossom.500",
            "borderWidth": 1,
            "borderColor": "blossom.500"
          },
          "emergency": {
            "backgroundColor": "sky.500",
            "textColor": "white",
            "borderWidth": 0
          },
          "text": {
            "backgroundColor": "transparent",
            "textColor": "text.primary",
            "borderWidth": 0
          }
        },
        "sizes": {
          "small": {
            "height": 32,
            "paddingHorizontal": "spacing.3",
            "fontSize": "sm"
          },
          "medium": {
            "height": 44,
            "paddingHorizontal": "spacing.4",
            "fontSize": "base"
          },
          "large": {
            "height": 56,
            "paddingHorizontal": "spacing.5",
            "fontSize": "lg"
          }
        },
        "states": {
          "default": {
            "opacity": 1,
            "scale": 1
          },
          "pressed": {
            "opacity": 0.8,
            "scale": 0.98
          },
          "disabled": {
            "opacity": 0.5,
            "scale": 1
          },
          "loading": {
            "opacity": 0.7,
            "showSpinner": true
          }
        }
      },
      
      "TextInput": {
        "variants": {
          "default": {
            "borderWidth": 1,
            "borderColor": "border.default",
            "backgroundColor": "surface.primary"
          },
          "filled": {
            "borderWidth": 0,
            "backgroundColor": "surface.secondary"
          }
        },
        "states": {
          "default": {
            "borderColor": "border.default"
          },
          "focused": {
            "borderColor": "blossom.500"
          },
          "error": {
            "borderColor": "semantic.error"
          }
        }
      }
    }
  },
  
  "microInteractions": {
    "emotionSelection": {
      "onTap": {
        "immediate": {
          "type": "scale",
          "value": 0.95,
          "duration": 100,
          "useNativeDriver": true
        },
        "complete": {
          "type": "scale",
          "value": 1,
          "duration": 100,
          "useNativeDriver": true
        }
      }
    },
    
    "aiAnalysis": {
      "inProgress": {
        "visual": "shimmerLoading",
        "text": "당신의 마음을 이해하는 중...",
        "shimmerConfig": {
          "baseColor": "blossom.50",
          "highlightColor": "white",
          "duration": 1000,
          "performant": true
        }
      }
    },
    
    "buttonPress": {
      "type": "scale",
      "pressIn": 0.98,
      "pressOut": 1,
      "duration": 100,
      "useNativeDriver": true
    },
    
    "cardTouch": {
      "type": "opacity",
      "activeOpacity": 0.8,
      "duration": 100,
      "useNativeDriver": true
    },
    
    "breathingAnimation": {
      "type": "scaleLoop",
      "minScale": 0.95,
      "maxScale": 1.05,
      "duration": 4000,
      "onlyWhenVisible": true,
      "pauseOnBackground": true
    }
  },
  
  "stateManagement": {
    "architecture": "contextWithReducer",
    "globalStates": {
      "user": {
        "profile": "UserProfile",
        "preferences": "UserPreferences",
        "emergencyContacts": "EmergencyContacts[]"
      },
      "emotion": {
        "current": "EmotionState",
        "history": "EmotionHistory[]",
        "analysisQueue": "AnalysisItem[]"
      },
      "crisis": {
        "level": "CrisisLevel",
        "lastCheck": "timestamp",
        "activeInterventions": "Intervention[]"
      },
      "privacy": {
        "consents": "ConsentMap",
        "dataSettings": "DataSettings"
      }
    },
    "localStates": {
      "screen": {
        "formData": "any",
        "validationErrors": "ValidationError[]",
        "loadingStates": "LoadingStateMap"
      },
      "ui": {
        "animationStates": "AnimationStateMap",
        "modalVisibility": "ModalStateMap"
      }
    },
    "persistedStates": {
      "storage": "AsyncStorage",
      "encrypted": ["emergencyContacts", "privacySettings"],
      "synced": ["userPreferences", "emotionHistory"]
    }
  },
  
  "dataPrivacyCenter": {
    "simplified": true,
    "location": "Profile > 개인정보 관리",
    "layout": "twoLevel",
    "sections": [
      {
        "title": "필수 데이터",
        "description": "서비스 이용에 꼭 필요한 정보",
        "toggleable": false,
        "icon": "lock",
        "items": ["기본 프로필", "감정 일기", "앱 사용 기록"]
      },
      {
        "title": "선택 데이터",
        "description": "더 나은 서비스를 위한 정보",
        "toggleable": true,
        "defaultState": false,
        "quickAction": {
          "label": "모두 끄기",
          "action": "disableAllOptional"
        },
        "items": [
          {
            "label": "AI 서비스 개선",
            "key": "aiImprovement",
            "description": "익명화된 데이터로 AI 성능 향상"
          },
          {
            "label": "전문가 연계",
            "key": "expertSharing",
            "description": "상담 효과를 위한 리포트 공유"
          }
        ]
      }
    ],
    "advancedOptions": {
      "collapsed": true,
      "label": "고급 설정",
      "content": {
        "dataJourney": "interactiveDiagram",
        "detailedRights": "expandableCards"
      }
    }
  },
  
  "offlineCapabilities": {
    "strategy": "offlineFirst",
    "essential": {
      "features": [
        "emotionCheckin",
        "journalEntry",
        "breathingExercises",
        "emergencyContacts",
        "crisisHotlines"
      ],
      "dataCache": {
        "duration": "7days",
        "size": "50MB",
        "priority": ["recentEntries", "aiSuggestions", "copingTools"]
      }
    },
    "syncStrategy": {
      "method": "queueAndSync",
      "trigger": "onNetworkRestore",
      "conflictResolution": "lastWriteWins",
      "retryPolicy": {
        "maxAttempts": 3,
        "backoffMultiplier": 2
      }
    },
    "ui": {
      "offlineIndicator": {
        "position": "top",
        "style": "subtle",
        "message": "오프라인 모드 - 자동 동기화됩니다"
      }
    }
  },
  
  "performanceOptimizations": {
    "animations": {
      "useNativeDriver": true,
      "preferTransform": true,
      "avoidLayoutAnimations": true,
      "maxConcurrent": 2
    },
    "images": {
      "lazyLoad": true,
      "cachePolicy": "diskAndMemory",
      "placeholders": "blurHash"
    },
    "lists": {
      "virtualization": true,
      "initialNumToRender": 10,
      "maxToRenderPerBatch": 5,
      "windowSize": 10
    },
    "bundle": {
      "splitChunks": true,
      "dynamicImports": ["heavyComponents", "analytics"],
      "treeShaking": true
    }
  },
  
  "implementationPhases": {
    "phase1": {
      "duration": "2weeks",
      "deliverables": [
        "designTokenSystem",
        "baseComponentLibrary",
        "navigationStructure",
        "emotionRecordingFlow"
      ],
      "priorities": ["performance", "accessibility", "coreFeatures"]
    },
    "phase2": {
      "duration": "2weeks",
      "deliverables": [
        "crisisResponseSystem",
        "aiTransparencyFeatures",
        "dataPrivacyCenter",
        "offlineSupport"
      ],
      "priorities": ["safety", "trust", "reliability"]
    },
    "phase3": {
      "duration": "2weeks",
      "deliverables": [
        "expertConnection",
        "communityFeatures",
        "advancedInsights",
        "performanceTuning"
      ],
      "priorities": ["engagement", "growth", "optimization"]
    }
  }
}