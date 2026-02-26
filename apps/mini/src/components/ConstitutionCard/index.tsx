import { View, Text } from '@tarojs/components'
import './index.scss'

interface ConstitutionCardProps {
  /** 体质名称 */
  name: string
  /** 体质得分 */
  score: number
  /** 体质特征 */
  features?: string[]
  /** 主题色 */
  color?: string
  /** 是否为主体质 */
  isPrimary?: boolean
  /** 点击回调 */
  onClick?: () => void
}

export default function ConstitutionCard({
  name,
  score,
  features = [],
  color = '#8b5a2b',
  isPrimary = false,
  onClick,
}: ConstitutionCardProps) {
  return (
    <View
      className={`constitution-card ${isPrimary ? 'constitution-card--primary' : ''}`}
      style={
        isPrimary
          ? { background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }
          : {}
      }
      onClick={onClick}
    >
      <View className='card-header'>
        <View className='card-icon' style={!isPrimary ? { background: color } : {}}>
          <Text className='icon-char'>{name.charAt(0)}</Text>
        </View>
        <View className='card-info'>
          <Text className={`card-name ${isPrimary ? 'card-name--light' : ''}`}>
            {name}
          </Text>
          <View className='score-row'>
            <Text className={`card-score ${isPrimary ? 'card-score--light' : ''}`}>
              {score}
            </Text>
            <Text className={`card-unit ${isPrimary ? 'card-unit--light' : ''}`}>
              分
            </Text>
          </View>
        </View>
      </View>

      {features.length > 0 && (
        <View className='card-features'>
          {features.slice(0, 4).map((feat, idx) => (
            <View
              key={idx}
              className={`feature-item ${isPrimary ? 'feature-item--light' : ''}`}
            >
              <Text
                className={`feature-text ${isPrimary ? 'feature-text--light' : ''}`}
              >
                {feat}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* 分数条 */}
      <View className='score-bar'>
        <View
          className={`score-bar-track ${isPrimary ? 'score-bar-track--light' : ''}`}
        >
          <View
            className='score-bar-fill'
            style={{
              width: `${score}%`,
              background: isPrimary ? 'rgba(255,255,255,0.8)' : color,
            }}
          />
        </View>
      </View>
    </View>
  )
}
