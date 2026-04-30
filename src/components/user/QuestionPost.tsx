// 'use client'

// import { Eye, MessageCircle, Send, ThumbsUp, ChevronDown, ChevronUp, Tag } from 'lucide-react'
// import { useState } from 'react'
// import { ShareModal } from '@/components/shared/ShareModal'
// import { useOpenContent } from '@/hooks/useOpenContent'

// interface Answer {
//   id: string
//   author: {
//     name: string
//     title: string
//     avatar: string
//   }
//   content: string
//   timestamp: string
//   likes: number
//   replies?: Answer[]
// }

// export default QuestionPost;

// interface QuestionPostProps {
//   id?: string
//   author: {
//     name: string
//     title: string
//     avatar: string
//   }
//   question?: string // frontend prop
//   content?: string  // backend field
//   description?: string
//   tags?: string[]
//   timestamp: string
//   answers?: number
//   views?: number
//   trending?: boolean
//   answersList?: Answer[]
//   layout?: 'hybrid' | 'previous' | 'below'
// }

// export function QuestionPost({ 
//   id = Date.now().toString(),
//   author, 
//   question,
//   content,
//   description,
//   tags = [], 
//   timestamp, 
//   answers, 
//   views,
//   answersList = [],
//   layout = 'below'
// }: QuestionPostProps) {
//   const [answerText, setAnswerText] = useState('')
//   const [showAnswerBox, setShowAnswerBox] = useState(false)
//   const [showAllAnswers, setShowAllAnswers] = useState(false)
//   const [showShareModal, setShowShareModal] = useState(false)
//   const [replyingTo, setReplyingTo] = useState<string | null>(null)
//   const [replyInput, setReplyInput] = useState('')
//   const [answersList_state, setAnswersList_state] = useState<Answer[]>(
//     answersList.map(a => ({
//       id: a.id,
//       author: a.author,
//       content: a.content,
//       timestamp: a.timestamp,
//       likes: a.likes,
//       replies: a.replies || []
//     }))
//   )
//   const [likedItems, setLikedItems] = useState<Set<string>>(new Set())
//   const { openQuestion } = useOpenContent()

//   // Helper function to recursively render infinite nested replies
//   const renderNestedReplies = (replies: Answer[], parentId: string, parentReplyId?: string): JSX.Element => {
//     if (!replies || replies.length === 0) return <></>

//     return (
//       <div className="mt-2 ml-8 space-y-2">
//         {replies.map((nestedReply) => (
//           <div key={nestedReply.id}>
//             <div className="flex gap-2">
//               <img
//                 src={nestedReply.author.avatar}
//                 className="w-6 h-6 rounded-full object-cover"
//                 alt={nestedReply.author.name}
//               />
//               <div className="flex-1">
//                 <div className="bg-gray-50 rounded-lg px-2.5 py-1.5" style={{ border: '1px solid #E8E8E8' }}>
//                   <p className="font-semibold text-xs" style={{ color: '#2B2B2B' }}>
//                     {nestedReply.author.name}
//                   </p>
//                   <p className="text-xs" style={{ color: '#5F6368' }}>
//                     {nestedReply.content}
//                   </p>
//                 </div>
//                 <div className="flex gap-2 mt-0.5 px-2 text-xs" style={{ color: '#5F6368' }}>
//                   <button 
//                     onClick={() => handleLikeAnswer(nestedReply.id, parentReplyId || parentId)}
//                     className="hover:opacity-70 transition-all font-medium flex items-center gap-1"
//                     style={{ color: likedItems.has(`${parentReplyId || parentId}-reply-${nestedReply.id}`) ? '#1d9bf0' : '#5F6368' }}>
//                     <ThumbsUp className="w-4 h-4" />
//                     <span>{nestedReply.likes}</span>
//                   </button>
//                   <button 
//                     onClick={() => setReplyingTo(replyingTo === `reply-${nestedReply.id}` ? null : `reply-${nestedReply.id}`)}
//                     className="hover:opacity-70 transition-all">
//                     Reply
//                   </button>
//                   <span>
//                     {nestedReply.timestamp}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Reply to Nested Reply Input */}
//             {replyingTo === `reply-${nestedReply.id}` && (
//               <div className="flex gap-2 mt-2 ml-8">
//                 <img
//                   src="/avatar.png"
//                   className="w-6 h-6 rounded-full object-cover"
//                   alt="Your avatar"
//                 />
//                 <input
//                   type="text"
//                   placeholder="Write a reply..."
//                   value={replyInput}
//                   onChange={(e) => setReplyInput(e.target.value)}
//                   onKeyPress={(e) => e.key === 'Enter' && handleAddReply(parentId, nestedReply.id)}
//                   className="flex-1 text-xs border rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
//                   style={{ borderColor: '#E8E8E8' }}
//                   autoFocus
//                 />
//                 <button 
//                   onClick={() => handleAddReply(parentId, nestedReply.id)}
//                   className="text-blue-600 hover:text-blue-700 px-2 py-1.5 rounded-full hover:bg-blue-50 transition text-xs">
//                   Send
//                 </button>
//               </div>
//             )}

//             {/* Recursively render deeper nested replies */}
//             {nestedReply.replies && nestedReply.replies.length > 0 && 
//               renderNestedReplies(nestedReply.replies, parentId, nestedReply.id)
//             }
//           </div>
//         ))}
//       </div>
//     )
//   }

//   const formatViews = (count?: number) => {
//     if (!count) return '0'

//     if (count >= 1000) {
//       return (count / 1000).toFixed(1) + 'k'
//     }

//     return count.toString()
//   }

//   const handlePostAnswer = () => {
//     if (answerText.trim()) {
//       const newAnswer: Answer = {
//         id: Date.now().toString(),
//         author: { name: 'You', avatar: '/avatar.png', title: 'Your Title' },
//         content: answerText,
//         timestamp: 'just now',
//         likes: 0,
//         replies: []
//       }
//       setAnswersList_state([...answersList_state, newAnswer])
//       setAnswerText('')
//       setShowAnswerBox(false)
//     }
//   }

//   // Use 'question' prop if present, otherwise fallback to 'content' (backend field)
//   const displayQuestion = question || content || '';

//   const handleOpenViewer = () => {
//     const questionData = {
//       id,
//       author,
//       question: displayQuestion,
//       description,
//       tags,
//       timestamp,
//       answers,
//       views,
//       answersList: answersList_state,
//       layout
//     }
//     openQuestion(questionData)
//   }

//   const handleLikeAnswer = (answerId: string, parentId?: string) => {
//     const itemId = parentId ? `${parentId}-reply-${answerId}` : `answer-${answerId}`
//     const isLiked = likedItems.has(itemId)
//     const newLikedItems = new Set(likedItems)

//     if (isLiked) {
//       newLikedItems.delete(itemId)
//     } else {
//       newLikedItems.add(itemId)
//     }
//     setLikedItems(newLikedItems)

//     if (parentId) {
//       // Like/Unlike a reply at any depth
//       const likeDelta = isLiked ? -1 : 1

//       // Recursive function to find and update a reply at ANY depth
//       const findAndUpdateReply = (replies: Answer[]): boolean => {
//         for (let reply of replies) {
//           if (reply.id === answerId) {
//             // Found the target reply to like
//             reply.likes += likeDelta
//             return true
//           }
//           // Recursively search in nested replies
//           if (reply.replies && findAndUpdateReply(reply.replies)) {
//             return true
//           }
//         }
//         return false
//       }

//       setAnswersList_state(
//         answersList_state.map(answer => {
//           const updatedAnswer = { ...answer }
//           // Search and update within this answer's entire reply tree
//           findAndUpdateReply(updatedAnswer.replies || [])
//           return updatedAnswer
//         })
//       )
//     } else {
//       // Like/Unlike an answer
//       setAnswersList_state(
//         answersList_state.map(answer =>
//           answer.id === answerId 
//             ? { ...answer, likes: isLiked ? answer.likes - 1 : answer.likes + 1 } 
//             : answer
//         )
//       )
//     }
//   }

//   const handleAddReply = (answerId: string, parentReplyId?: string) => {
//     if (replyInput.trim()) {
//       const newReply: Answer = {
//         id: Date.now().toString(),
//         author: { name: 'You', avatar: '/avatar.png', title: 'Your Title' },
//         content: replyInput,
//         timestamp: 'just now',
//         likes: 0,
//         replies: []
//       }

//       // Recursive function to add reply at any depth
//       const addReplyAtDepth = (replies: Answer[], targetId: string): boolean => {
//         for (let reply of replies) {
//           if (reply.id === targetId) {
//             reply.replies = [...(reply.replies || []), newReply]
//             return true
//           }
//           // Recursively search deeper
//           if (reply.replies && addReplyAtDepth(reply.replies, targetId)) {
//             return true
//           }
//         }
//         return false
//       }

//       if (parentReplyId) {
//         // Adding a reply to a reply (at any depth)
//         setAnswersList_state(
//           answersList_state.map(answer => {
//             if (answer.id === answerId) {
//               const updatedAnswer = { ...answer }
//               addReplyAtDepth(updatedAnswer.replies || [], parentReplyId)
//               return updatedAnswer
//             }
//             return answer
//           })
//         )
//       } else {
//         // Adding a reply to an answer
//         setAnswersList_state(
//           answersList_state.map(answer => {
//             if (answer.id === answerId) {
//               return {
//                 ...answer,
//                 replies: [...(answer.replies || []), newReply]
//               }
//             }
//             return answer
//           })
//         )
//       }
//       setReplyInput('')
//       setReplyingTo(null)
//     }
//   }

//   const topAnswer = answersList_state[0]

//   return (
//     <>
//       <div 
//         className="bg-white rounded-2xl shadow-sm p-6 mb-4 hover:shadow-md transition-all"
//         style={{ border: '1px solid #E8E8E8' }}
//       >
//       {/* Post Header */}
//       <div className="flex items-start gap-3 mb-4">
//         <img
//           src={author?.avatar || '/avatar.png'}
//           alt={author?.name || 'User'}
//           className="w-12 h-12 rounded-full object-cover flex-shrink-0"
//         />
//         <div className="flex-1 min-w-0">
//           <h3 className="font-semibold" style={{ color: '#2B2B2B' }}>
//             {author?.name || 'User'}
//           </h3>
//           <p className="text-sm" style={{ color: '#5F6368' }}>
//             {author?.title || 'Professional Title'}
//           </p>
//           <p className="text-sm" style={{ color: '#9AA0A6' }}>
//             {timestamp}
//           </p>
//         </div>
//       </div>

//       {/* Question */}
//       <div className="mb-4">
//         <h2 
//           onClick={handleOpenViewer}
//           className="text-lg font-semibold mb-2 leading-relaxed cursor-pointer hover:opacity-80 transition-opacity" 
//           style={{ color: '#2B2B2B' }}
//         >
//           {displayQuestion}
//         </h2>
        
//         {description && (
//           <p 
//             onClick={handleOpenViewer}
//             className="text-sm leading-relaxed cursor-pointer hover:opacity-80 transition-opacity" 
//             style={{ color: '#5F6368' }}
//           >
//             {description}
//           </p>
//         )}
//       </div>

//       {/* Tags */}
//       {tags.length > 0 && (
//         <div className="flex items-center gap-2 mb-4">
//          <Tag className="w-4 h-4" />
//           <div className="flex flex-wrap gap-2">
//             {tags.map((tag, idx) => (
//               <span 
//                 key={idx} 
//                 className="px-3 py-1 rounded-full text-sm font-medium"
//                 style={{ 
//                   backgroundColor: '#F3F4F6',
//                   color: '#5F6368' 
//                 }}
//               >
//                 {tag}
//               </span>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* LAYOUT: HYBRID - Top Answer Preview */}
//       {layout === 'hybrid' && topAnswer && (
//         <div 
//           className="mb-4 p-4 rounded-xl cursor-pointer hover:shadow-sm transition-all"
//           style={{ 
//             backgroundColor: '#F8F9FA',
//             border: '1px solid #E8E8E8'
//           }}
//           onClick={() => setShowAllAnswers(!showAllAnswers)}
//         >
//           <div className="flex items-start gap-3 mb-2">
//             <img
//               src={topAnswer.author.avatar}
//               alt={topAnswer.author.name}
//               className="w-10 h-10 rounded-full object-cover flex-shrink-0"
//             />
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center gap-2">
//                 <h4 className="font-semibold text-sm" style={{ color: '#2B2B2B' }}>
//                   {topAnswer.author.name}
//                 </h4>
//                 <span 
//                   className="px-2 py-0.5 rounded text-xs font-medium"
//                   style={{ 
//                     backgroundColor: '#E8F5E9',
//                     color: '#2E7D32'
//                   }}
//                 >
//                   ✓ Top Answer
//                 </span>
//               </div>
//               <p className="text-xs" style={{ color: '#5F6368' }}>
//                 {topAnswer.author.title}
//               </p>
//             </div>
//           </div>

//           <p className="text-sm leading-relaxed line-clamp-2 mb-2" style={{ color: '#2B2B2B' }}>
//             {topAnswer.content}
//           </p>

//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <button 
//                 onClick={() => handleLikeAnswer(topAnswer.id)}
//                 className="flex items-center gap-1.5 hover:opacity-70 transition-all">
//                 <ThumbsUp className="w-4 h-4" style={{ color: '#5F6368' }} />
//                 <span className="text-sm font-medium" style={{ color: '#5F6368' }}>
//                   {topAnswer.likes}
//                 </span>
//               </button>
//             </div>
//             <span className="text-xs font-medium flex items-center gap-1" style={{ color: '#2B2B2B' }}>
//               {showAllAnswers ? 'Hide answers' : 'Read more'}
//               {showAllAnswers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//             </span>
//           </div>
//         </div>
//       )}

//       {/* LAYOUT: PREVIOUS - Full Top Answer */}
//       {layout === 'previous' && topAnswer && (
//         <div className="mb-4 space-y-4">
//           {answersList_state.map((answer) => (
//             <div 
//               key={answer.id}
//               className="p-4 rounded-xl"
//               style={{ 
//                 backgroundColor: '#F8F9FA',
//                 border: '1px solid #E8E8E8'
//               }}
//             >
//               <div className="flex items-start gap-3 mb-3">
//                 <img
//                   src={answer.author.avatar}
//                   alt={answer.author.name}
//                   className="w-10 h-10 rounded-full object-cover flex-shrink-0"
//                 />
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-2">
//                     <h4 className="font-semibold text-sm" style={{ color: '#2B2B2B' }}>
//                       {answer.author.name}
//                     </h4>
//                     <span 
//                       className="px-2 py-0.5 rounded text-xs font-medium"
//                       style={{ 
//                         backgroundColor: '#E8F5E9',
//                         color: '#2E7D32'
//                       }}
//                     >
//                       ✓ Answered
//                     </span>
//                   </div>
//                   <p className="text-xs" style={{ color: '#5F6368' }}>
//                     {answer.author.title}
//                   </p>
//                   <p className="text-xs" style={{ color: '#9AA0A6' }}>
//                     {answer.timestamp}
//                   </p>
//                 </div>
//               </div>

//               <p className="text-sm leading-relaxed mb-3" style={{ color: '#2B2B2B' }}>
//                 {answer.content}
//               </p>

//               <div className="flex items-center gap-4 mb-3">
//                 <button 
//                   onClick={() => handleLikeAnswer(answer.id)}
//                   className="flex items-center gap-1.5 hover:opacity-70 transition-all">
//                   <ThumbsUp className="w-4 h-4" style={{ color: '#5F6368' }} />
//                   <span className="text-sm font-medium" style={{ color: '#5F6368' }}>
//                     {answer.likes}
//                   </span>
//                 </button>
//                 <button 
//                   onClick={() => setReplyingTo(replyingTo === answer.id ? null : answer.id)}
//                   className="text-sm font-medium hover:opacity-70 transition-all" style={{ color: '#5F6368' }}>
//                   Reply
//                 </button>
//               </div>

//               {/* Reply Input */}
//               {replyingTo === answer.id && (
//                 <div className="flex gap-2 mt-3 mb-3">
//                   <img
//                     src="/avatar.png"
//                     className="w-7 h-7 rounded-full object-cover"
//                     alt="Your avatar"
//                   />
//                   <input
//                     type="text"
//                     placeholder="Write a reply..."
//                     value={replyInput}
//                     onChange={(e) => setReplyInput(e.target.value)}
//                     onKeyPress={(e) => e.key === 'Enter' && handleAddReply(answer.id)}
//                     className="flex-1 text-xs border rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
//                     style={{ borderColor: '#E8E8E8' }}
//                     autoFocus
//                   />
//                   <button 
//                     onClick={() => handleAddReply(answer.id)}
//                     className="text-blue-600 hover:text-blue-700 px-2 py-1.5 rounded-full hover:bg-blue-50 transition">
//                     Send
//                   </button>
//                 </div>
//               )}

//               {/* Replies */}
//               {answer.replies && answer.replies.length > 0 && (
//                 <div className="mt-3 ml-8 space-y-3">
//                   {answer.replies.map((reply) => (
//                     <div key={reply.id}>
//                       <div className="flex gap-2">
//                         <img
//                           src={reply.author.avatar}
//                           className="w-7 h-7 rounded-full object-cover"
//                           alt={reply.author.name}
//                         />
//                         <div className="flex-1">
//                           <div className="bg-white rounded-lg px-3 py-2" style={{ border: '1px solid #E8E8E8' }}>
//                             <p className="font-semibold text-xs" style={{ color: '#2B2B2B' }}>
//                               {reply.author.name}
//                             </p>
//                             <p className="text-xs" style={{ color: '#5F6368' }}>
//                               {reply.content}
//                             </p>
//                           </div>
//                           <div className="flex gap-3 mt-1 px-3 text-xs" style={{ color: '#5F6368' }}>
//                             <button 
//                               onClick={() => handleLikeAnswer(reply.id, answer.id)}
//                               className="hover:opacity-70 transition-all font-medium flex items-center gap-1"
//                               style={{ color: likedItems.has(`${answer.id}-reply-${reply.id}`) ? '#1d9bf0' : '#5F6368' }}>
//                               <ThumbsUp className="w-4 h-4" />
//                               <span>{reply.likes}</span>
//                             </button>
//                             <button 
//                               onClick={() => setReplyingTo(replyingTo === `reply-${reply.id}` ? null : `reply-${reply.id}`)}
//                               className="hover:opacity-70 transition-all">
//                               Reply
//                             </button>
//                             <span>
//                               {reply.timestamp}
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Reply to Reply Input */}
//                       {replyingTo === `reply-${reply.id}` && (
//                         <div className="flex gap-2 mt-2 ml-8">
//                           <img
//                             src="/avatar.png"
//                             className="w-6 h-6 rounded-full object-cover"
//                             alt="Your avatar"
//                           />
//                           <input
//                             type="text"
//                             placeholder="Write a reply..."
//                             value={replyInput}
//                             onChange={(e) => setReplyInput(e.target.value)}
//                             onKeyPress={(e) => e.key === 'Enter' && handleAddReply(answer.id, reply.id)}
//                             className="flex-1 text-xs border rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
//                             style={{ borderColor: '#E8E8E8' }}
//                             autoFocus
//                           />
//                           <button 
//                             onClick={() => handleAddReply(answer.id, reply.id)}
//                             className="text-blue-600 hover:text-blue-700 px-2 py-1.5 rounded-full hover:bg-blue-50 transition text-xs">
//                             Send
//                           </button>
//                         </div>
//                       )}

//                       {/* Recursively render all nested replies at any depth */}
//                       {renderNestedReplies(reply.replies || [], answer.id, reply.id)}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Action Footer */}
//       <div className="flex items-center gap-6 pt-4 pb-4" style={{ borderTop: '1px solid #E8E8E8', borderBottom: '1px solid #E8E8E8' }}>
//         <button
//           onClick={() => setShowAllAnswers(!showAllAnswers)}
//           className="flex items-center gap-2 hover:opacity-70 transition-all cursor-pointer"
//           style={{ color: '#5F6368' }}
//         >
//           <MessageCircle className="w-4 h-4" />
//           <span className="text-sm font-medium">{answers} Answers</span>
//         </button>

//         <div className="flex items-center gap-2" style={{ color: '#5F6368' }}>
//           <Eye className="w-4 h-4" />
//           <span className="text-sm font-medium">{formatViews(views)}</span>
//         </div>

//         <button
//           onClick={() => setShowShareModal(true)}
//           className="flex items-center gap-2 ml-auto hover:opacity-70 transition-all cursor-pointer"
//           style={{ color: '#5F6368' }}
//         >
//           <Send className="w-4 h-4" />
//           <span className="text-sm font-medium">Send</span>
//         </button>
//       </div>

//       {/* Write Your Answer Section */}
//       {!showAnswerBox ? (
//         <div className="flex items-center gap-3 mt-4">
//           <button
//             onClick={() => setShowAnswerBox(true)}
//             className="flex-1 py-3 rounded-xl font-medium transition-all hover:bg-gray-100"
//             style={{ 
//               backgroundColor: '#FFFFFF',
//               color: '#2B2B2B',
//               opacity: 0.5,
//               border: '2px solid #E8E8E8'
//             }}
//           >
//             ✍️ Write your answer
//           </button>
//           <button
//             onClick={() => setShowAnswerBox(true)}
//             className="px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
//             style={{ 
//               backgroundColor: '#2B2B2B',
//               color: '#FFFFFF'
//             }}
//           >
//             Post Answer
//           </button>
//         </div>
//       ) : (
//         <div className="mt-4">
//           <textarea
//             value={answerText}
//             onChange={(e) => setAnswerText(e.target.value)}
//             placeholder="Share your knowledge and help others..."
//             className="w-full p-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
//             style={{ 
//               backgroundColor: '#FFFFFF',
//               color: '#2B2B2B',
//               border: '2px solid #E8E8E8',
//               minHeight: '120px'
//             }}
//           />
//           <div className="flex items-center gap-3 mt-3">
//             <button
//               onClick={handlePostAnswer}
//               disabled={!answerText.trim()}
//               className="px-6 py-2.5 rounded-xl font-semibold transition-all"
//               style={{ 
//                 backgroundColor: answerText.trim() ? '#2B2B2B' : '#E8E8E8',
//                 color: answerText.trim() ? '#FFFFFF' : '#9AA0A6',
//                 cursor: answerText.trim() ? 'pointer' : 'not-allowed'
//               }}
//             >
//               Post Answer
//             </button>
//             <button
//               onClick={() => {
//                 setShowAnswerBox(false)
//                 setAnswerText('')
//               }}
//               className="px-6 py-2.5 rounded-xl font-medium transition-all hover:bg-gray-100"
//               style={{ 
//                 color: '#5F6368',
//                 border: '1px solid #E8E8E8'
//               }}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//               {/* LAYOUT: HYBRID - Expandable Full Answers */}
//       {layout === 'hybrid' && showAllAnswers && answersList_state.length > 0 && (
//         <div className="mt-6 pt-6" style={{ borderTop: '2px solid #E8E8E8' }}>
//           <h3 className="font-semibold mb-4" style={{ color: '#2B2B2B' }}>
//             💬 All {answers} {answers === 1 ? 'Answer' : 'Answers'}
//           </h3>
          
//           <div className="space-y-4">
//             {answersList_state.map((answer) => (
//               <div 
//                 key={answer.id}
//                 className="p-4 rounded-xl"
//                 style={{ 
//                   backgroundColor: '#F8F9FA',
//                   border: '1px solid #E8E8E8'
//                 }}
//               >
//                 <div className="flex items-start gap-3 mb-3">
//                   <img
//                     src={answer.author.avatar}
//                     alt={answer.author.name}
//                     className="w-10 h-10 rounded-full object-cover flex-shrink-0"
//                   />
//                   <div className="flex-1 min-w-0">
//                     <h4 className="font-semibold text-sm" style={{ color: '#2B2B2B' }}>
//                       {answer.author.name}
//                     </h4>
//                     <p className="text-xs" style={{ color: '#5F6368' }}>
//                       {answer.author.title}
//                     </p>
//                     <p className="text-xs" style={{ color: '#9AA0A6' }}>
//                       {answer.timestamp}
//                     </p>
//                   </div>
//                 </div>

//                 <p className="text-sm leading-relaxed mb-3" style={{ color: '#2B2B2B' }}>
//                   {answer.content}
//                 </p>

//                 <div className="flex items-center gap-4 mb-3">
//                   <button 
//                     onClick={() => handleLikeAnswer(answer.id)}
//                     className="flex items-center gap-1.5 hover:opacity-70 transition-all font-medium"
//                     style={{ color: likedItems.has(`answer-${answer.id}`) ? '#1d9bf0' : '#5F6368' }}>
//                     <ThumbsUp className="w-4 h-4" />
//                     <span className="text-sm">
//                       {answer.likes}
//                     </span>
//                   </button>
//                   <button 
//                     onClick={() => setReplyingTo(replyingTo === `answer-${answer.id}` ? null : `answer-${answer.id}`)}
//                     className="text-sm font-medium hover:opacity-70 transition-all" style={{ color: '#5F6368' }}>
//                     Reply
//                   </button>
//                 </div>

//                 {/* Reply Input */}
//                 {replyingTo === `answer-${answer.id}` && (
//                   <div className="flex gap-2 mt-3 mb-3">
//                     <img
//                       src="/avatar.png"
//                       className="w-7 h-7 rounded-full object-cover"
//                       alt="Your avatar"
//                     />
//                     <input
//                       type="text"
//                       placeholder="Write a reply..."
//                       value={replyInput}
//                       onChange={(e) => setReplyInput(e.target.value)}
//                       onKeyPress={(e) => e.key === 'Enter' && handleAddReply(answer.id)}
//                       className="flex-1 text-xs border rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
//                       style={{ borderColor: '#E8E8E8' }}
//                       autoFocus
//                     />
//                     <button 
//                       onClick={() => handleAddReply(answer.id)}
//                       className="text-blue-600 hover:text-blue-700 px-2 py-1.5 rounded-full hover:bg-blue-50 transition">
//                       Send
//                     </button>
//                   </div>
//                 )}

//                 {/* Replies */}
//                 {answer.replies && answer.replies.length > 0 && (
//                   <div className="mt-3 ml-8 space-y-3">
//                     {answer.replies.map((reply) => (
//                       <div key={reply.id}>
//                         <div className="flex gap-2">
//                           <img
//                             src={reply.author.avatar}
//                             className="w-7 h-7 rounded-full object-cover"
//                             alt={reply.author.name}
//                           />
//                           <div className="flex-1">
//                             <div className="bg-white rounded-lg px-3 py-2" style={{ border: '1px solid #E8E8E8' }}>
//                               <p className="font-semibold text-xs" style={{ color: '#2B2B2B' }}>
//                                 {reply.author.name}
//                               </p>
//                               <p className="text-xs" style={{ color: '#5F6368' }}>
//                                 {reply.content}
//                               </p>
//                             </div>
//                             <div className="flex gap-3 mt-1 px-3 text-xs" style={{ color: '#5F6368' }}>
//                               <button 
//                                 onClick={() => handleLikeAnswer(reply.id, answer.id)}
//                                 className="hover:opacity-70 transition-all font-medium flex items-center gap-1"
//                                 style={{ color: likedItems.has(`${answer.id}-reply-${reply.id}`) ? '#1d9bf0' : '#5F6368' }}>
//                                 <ThumbsUp className="w-4 h-4" />
//                                 <span>{reply.likes}</span>
//                               </button>
//                               <button 
//                                 onClick={() => setReplyingTo(replyingTo === `reply-${reply.id}` ? null : `reply-${reply.id}`)}
//                                 className="hover:opacity-70 transition-all">
//                                 Reply
//                               </button>
//                               <span>
//                                 {reply.timestamp}
//                               </span>
//                             </div>
//                           </div>
//                         </div>

//                         {/* Reply to Reply Input */}
//                         {replyingTo === `reply-${reply.id}` && (
//                           <div className="flex gap-2 mt-2 ml-8">
//                             <img
//                               src="/avatar.png"
//                               className="w-6 h-6 rounded-full object-cover"
//                               alt="Your avatar"
//                             />
//                             <input
//                               type="text"
//                               placeholder="Write a reply..."
//                               value={replyInput}
//                               onChange={(e) => setReplyInput(e.target.value)}
//                               onKeyPress={(e) => e.key === 'Enter' && handleAddReply(answer.id, reply.id)}
//                               className="flex-1 text-xs border rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
//                               style={{ borderColor: '#E8E8E8' }}
//                               autoFocus
//                             />
//                             <button 
//                               onClick={() => handleAddReply(answer.id, reply.id)}
//                               className="text-blue-600 hover:text-blue-700 px-2 py-1.5 rounded-full hover:bg-blue-50 transition text-xs">
//                               Send
//                             </button>
//                           </div>
//                         )}

//                         {/* Recursively render all nested replies at any depth */}
//                         {renderNestedReplies(reply.replies || [], answer.id, reply.id)}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* LAYOUT: BELOW - Answers Always Visible Below */}
//       {layout === 'below' && answersList_state.length > 0 && (
//         <div className="mt-6 pt-6" style={{ borderTop: '2px solid #E8E8E8' }}>
//           <h3 className="font-semibold mb-4" style={{ color: '#2B2B2B' }}>
//             💬 All {answers} {answers === 1 ? 'Answer' : 'Answers'}
//           </h3>
          
//           <div className="space-y-4">
//             {answersList_state.map((answer) => (
//               <div 
//                 key={answer.id}
//                 className="p-4 rounded-xl"
//                 style={{ 
//                   backgroundColor: '#F8F9FA',
//                   border: '1px solid #E8E8E8'
//                 }}
//               >
//                 <div className="flex items-start gap-3 mb-3">
//                   <img
//                     src={answer.author.avatar}
//                     alt={answer.author.name}
//                     className="w-10 h-10 rounded-full object-cover flex-shrink-0"
//                   />
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-2">
//                       <h4 className="font-semibold text-sm" style={{ color: '#2B2B2B' }}>
//                         {answer.author.name}
//                       </h4>
//                       <span 
//                         className="px-2 py-0.5 rounded text-xs font-medium"
//                         style={{ 
//                           backgroundColor: '#E8F5E9',
//                           color: '#2E7D32'
//                         }}
//                       >
//                         ✓ Answered
//                       </span>
//                     </div>
//                     <p className="text-xs" style={{ color: '#5F6368' }}>
//                       {answer.author.title}
//                     </p>
//                     <p className="text-xs" style={{ color: '#9AA0A6' }}>
//                       {answer.timestamp}
//                     </p>
//                   </div>
//                 </div>

//                 <p className="text-sm leading-relaxed mb-3" style={{ color: '#2B2B2B' }}>
//                   {answer.content}
//                 </p>

//                 <div className="flex items-center gap-4 mb-3">
//                   <button 
//                     onClick={() => handleLikeAnswer(answer.id)}
//                     className="flex items-center gap-1.5 hover:opacity-70 transition-all font-medium"
//                     style={{ color: likedItems.has(`answer-${answer.id}`) ? '#1d9bf0' : '#5F6368' }}>
//                     <ThumbsUp className="w-4 h-4" />
//                     <span className="text-sm">
//                       {answer.likes}
//                     </span>
//                   </button>
//                   <button 
//                     onClick={() => setReplyingTo(replyingTo === `answer-${answer.id}` ? null : `answer-${answer.id}`)}
//                     className="text-sm font-medium hover:opacity-70 transition-all" style={{ color: '#5F6368' }}>
//                     Reply
//                   </button>
//                 </div>

//                 {/* Reply Input */}
//                 {replyingTo === `answer-${answer.id}` && (
//                   <div className="flex gap-2 mt-3 mb-3">
//                     <img
//                       src="/avatar.png"
//                       className="w-7 h-7 rounded-full object-cover"
//                       alt="Your avatar"
//                     />
//                     <input
//                       type="text"
//                       placeholder="Write a reply..."
//                       value={replyInput}
//                       onChange={(e) => setReplyInput(e.target.value)}
//                       onKeyPress={(e) => e.key === 'Enter' && handleAddReply(answer.id)}
//                       className="flex-1 text-xs border rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
//                       style={{ borderColor: '#E8E8E8' }}
//                       autoFocus
//                     />
//                     <button 
//                       onClick={() => handleAddReply(answer.id)}
//                       className="text-blue-600 hover:text-blue-700 px-2 py-1.5 rounded-full hover:bg-blue-50 transition">
//                       Send
//                     </button>
//                   </div>
//                 )}

//                 {/* Replies */}
//                 {answer.replies && answer.replies.length > 0 && (
//                   <div className="mt-3 ml-8 space-y-3">
//                     {answer.replies.map((reply) => (
//                       <div key={reply.id}>
//                         <div className="flex gap-2">
//                           <img
//                             src={reply.author.avatar}
//                             className="w-7 h-7 rounded-full object-cover"
//                             alt={reply.author.name}
//                           />
//                           <div className="flex-1">
//                             <div className="bg-white rounded-lg px-3 py-2" style={{ border: '1px solid #E8E8E8' }}>
//                               <p className="font-semibold text-xs" style={{ color: '#2B2B2B' }}>
//                                 {reply.author.name}
//                               </p>
//                               <p className="text-xs" style={{ color: '#5F6368' }}>
//                                 {reply.content}
//                               </p>
//                             </div>
//                             <div className="flex gap-3 mt-1 px-3 text-xs" style={{ color: '#5F6368' }}>
//                               <button 
//                                 onClick={() => handleLikeAnswer(reply.id, answer.id)}
//                                 className="hover:opacity-70 transition-all font-medium flex items-center gap-1"
//                                 style={{ color: likedItems.has(`${answer.id}-reply-${reply.id}`) ? '#1d9bf0' : '#5F6368' }}>
//                                 <ThumbsUp className="w-4 h-4" />
//                                 <span>{reply.likes}</span>
//                               </button>
//                               <button 
//                                 onClick={() => setReplyingTo(replyingTo === `reply-${reply.id}` ? null : `reply-${reply.id}`)}
//                                 className="hover:opacity-70 transition-all">
//                                 Reply
//                               </button>
//                               <span>
//                                 {reply.timestamp}
//                               </span>
//                             </div>
//                           </div>
//                         </div>

//                         {/* Reply to Reply Input */}
//                         {replyingTo === `reply-${reply.id}` && (
//                           <div className="flex gap-2 mt-2 ml-8">
//                             <img
//                               src="/avatar.png"
//                               className="w-6 h-6 rounded-full object-cover"
//                               alt="Your avatar"
//                             />
//                             <input
//                               type="text"
//                               placeholder="Write a reply..."
//                               value={replyInput}
//                               onChange={(e) => setReplyInput(e.target.value)}
//                               onKeyPress={(e) => e.key === 'Enter' && handleAddReply(answer.id, reply.id)}
//                               className="flex-1 text-xs border rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
//                               style={{ borderColor: '#E8E8E8' }}
//                               autoFocus
//                             />
//                             <button 
//                               onClick={() => handleAddReply(answer.id, reply.id)}
//                               className="text-blue-600 hover:text-blue-700 px-2 py-1.5 rounded-full hover:bg-blue-50 transition text-xs">
//                               Send
//                             </button>
//                           </div>
//                         )}

//                         {/* Recursively render all nested replies at any depth */}
//                         {renderNestedReplies(reply.replies || [], answer.id, reply.id)}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>

//     {/* Share Modal */}
//     <ShareModal
//       isOpen={showShareModal}
//       onClose={() => setShowShareModal(false)}
//       postContent={question}
//       contentType="question"
//       contentId={id}
//     />
//     </>
//   )
// }



'use client'

import {
  Eye,
  MessageCircle,
  Send,
  // ChevronDown,
  // ChevronUp,
  Tag,
  PenLine,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'

import { useState, useEffect, useRef } from 'react'
import { ShareModal } from '@/components/shared/ShareModal'
import { useOpenContent } from '@/hooks/useOpenContent'
import apiClient from '@/lib/api-client'
import { MoreVertical, Flag } from 'lucide-react'
import { ReportModal } from '@/components/shared/ReportModal'

interface Answer {
  id: string
  author: {
    name: string
    title: string
    avatar: string
  }
  content: string
  timestamp: string
  likes: number
  replies?: Answer[]
  parent?: any
}

interface QuestionPostProps {
  id?: string
  author: {
    name: string
    title: string
    avatar: string
  }
  question?: string
  content?: string
  description?: string
  tags?: string[]
  timestamp: string
  answers?: number
  views?: number
}

export function QuestionPost({
  id = '',
  author,
  question,
  content,
  description,
  tags = [],
  timestamp,
  // answers,
  views
}: QuestionPostProps) {

  const { openQuestion } = useOpenContent()

  const [answersList, setAnswersList] = useState<Answer[]>([])
  const [answerText, setAnswerText] = useState('')
  const [replyInput, setReplyInput] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [showAnswerBox, setShowAnswerBox] = useState(false)
  const [showAllAnswers, setShowAllAnswers] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const actionMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setShowActionMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayQuestion = question || content || ''

  // =========================
  // 🔄 FETCH ANSWERS
  // =========================

  useEffect(() => {
    const fetchAnswers = async () => {
      if (!id) return
      try {
        const res = await apiClient.getPostComments(id)
        setAnswersList(nestAnswers(res))
      } catch (err) {
        console.error('Failed to fetch answers')
      }
    }

    fetchAnswers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // =========================
  // 🧠 MAPPING
  // =========================

  const mapApiAnswerToUi = (apiComment: any): Answer => ({
    id: apiComment.id,
    author: {
      name: apiComment.user?.full_name || apiComment.user?.username || 'Unknown',
      avatar: apiComment.user?.profile_photo || '/avatar.png',
      title: apiComment.user?.profession || '',
    },
    content: apiComment.comment,
    timestamp: new Date(Number(apiComment.created_on)).toLocaleString(),
    likes: apiComment.likes || 0,
    replies: [],
    parent: apiComment.parent || null,
  })

  const nestAnswers = (comments: any[]): Answer[] => {
    const map: Record<string, Answer> = {}
    const roots: Answer[] = []

    comments.forEach((c) => {
      map[c.id] = { ...mapApiAnswerToUi(c), replies: [] }
    })

    comments.forEach((c) => {
      if (c.parent && c.parent.id && map[c.parent.id]) {
        map[c.parent.id].replies!.push(map[c.id])
      } else {
        roots.push(map[c.id])
      }
    })

    return roots
  }

  // =========================
  // ➕ ADD ANSWER
  // =========================

  const handlePostAnswer = async () => {
    if (!answerText.trim()) return

    try {
      await apiClient.addPostComment(id, answerText)

      const updated = await apiClient.getPostComments(id)
      setAnswersList(nestAnswers(updated))

      setAnswerText('')
      setShowAnswerBox(false)
    } catch (err) {
      console.error('Failed to post answer')
    }
  }

  // =========================
  // 💬 REPLY
  // =========================

  const handleAddReply = async (answerId: string, parentReplyId?: string) => {
    if (!replyInput.trim()) return

    try {
      await apiClient.addPostComment(
        id,
        replyInput,
        parentReplyId || answerId
      )

      const updated = await apiClient.getPostComments(id)
      setAnswersList(nestAnswers(updated))

      setReplyInput('')
      setReplyingTo(null)
    } catch (err) {
      console.error('Reply failed')
    }
  }

  // =========================
  // 👍 VOTE (AGREE/DISAGREE)
  // =========================

  const handleVoteAnswer = async (answerId: string, vote: 'up' | 'down') => {
    try {
      await apiClient.voteComment(answerId, vote)

      const updated = await apiClient.getPostComments(id)
      setAnswersList(nestAnswers(updated))
    } catch (err) {
      console.error('Vote failed')
    }
  }

  // =========================
  // 🔁 RECURSIVE REPLIES
  // =========================

  const renderReplies = (replies: Answer[], parentId: string) => {
    if (!replies || replies.length === 0) return null

    return (
      <div className="ml-8 mt-3 space-y-3">
        {replies.map((reply) => (
          <div key={reply.id}>
            <div className="flex gap-2">
              <img src={reply.author.avatar} alt={reply.author.name} className="w-6 h-6 rounded-full" />
              <div className="flex-1">
                <div className="bg-gray-100 px-3 py-2 rounded-lg">
                  <p className="text-xs font-semibold">{reply.author.name}</p>
                  <p className="text-xs">{reply.content}</p>
                </div>

                <div className="flex gap-3 text-xs mt-1">
                  <button onClick={() => handleVoteAnswer(reply.id, 'up')} className="flex items-center gap-1">
                    <ThumbsUp className="inline w-4 h-4" /> {reply.likes}
                  </button>
                  <button onClick={() => handleVoteAnswer(reply.id, 'down')} className="flex items-center gap-1">
                    <ThumbsDown className="inline w-4 h-4" /> Disagree
                  </button>
                  <button onClick={() => setReplyingTo(reply.id)}>
                    Reply
                  </button>
                </div>
              </div>
            </div>

            {replyingTo === reply.id && (
              <div className="ml-8 mt-2 flex gap-2">
                <input
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  className="flex-1 border rounded-full px-3 py-1 text-xs"
                />
                <button onClick={() => handleAddReply(parentId, reply.id)}>
                  Send
                </button>
              </div>
            )}

            {renderReplies(reply.replies || [], parentId)}
          </div>
        ))}
      </div>
    )
  }

  // =========================
  // 🎯 UI
  // =========================

  return (
    <>
      <div className="bg-white rounded-2xl border p-6 mb-4">

        {/* HEADER */}
        <div className="flex gap-3 mb-4">
          <img src={author.avatar} alt={author.name} className="w-12 h-12 rounded-full" />
          <div>
            <h3 className="font-semibold">{author.name}</h3>
            <p className="text-sm text-gray-500">{author.title}</p>
            <p className="text-xs text-gray-400">{timestamp}</p>
          </div>

          <div ref={actionMenuRef} className="relative">
            <button onClick={() => setShowActionMenu(!showActionMenu)}>
              <MoreVertical />
            </button>

            {showActionMenu && (
              <div className="absolute right-0 bg-white border rounded shadow p-2">
                <button
                  onClick={() => {
                    setShowReportModal(true)
                    setShowActionMenu(false)
                  }}
                  className="flex items-center gap-2 text-red-600 px-2 py-1"
                >
                  <Flag className="w-4 h-4" />
                  Report
                </button>
              </div>
            )}
          </div>
        </div>

        {/* QUESTION */}
        <h2
          onClick={() =>
            openQuestion({ id, question: displayQuestion })
          }
          className="text-lg font-semibold cursor-pointer"
        >
          {displayQuestion}
        </h2>

        {description && (
          <p className="text-sm text-gray-500 mt-2">{description}</p>
        )}

        
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4" />
              <div className="flex flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <span 
                  key={idx} 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: '#F3F4F6',
                    color: '#5F6368' 
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ACTION BAR */}
        <div className="flex gap-6 mt-4 border-y py-3 text-sm text-gray-500">
          <button onClick={() => setShowAllAnswers(!showAllAnswers)} className="flex items-center gap-1">
            <MessageCircle className="inline w-4 h-4" /> {answersList.length}
          </button>

          <div>
            <Eye className="inline w-4 h-4" /> {views}
          </div>

          <button className="ml-auto" onClick={() => setShowShareModal(true)}>
            <Send className="inline w-4 h-4" />
          </button>
        </div>

        {/* ANSWER INPUT */}
        {!showAnswerBox ? (
          <button
            onClick={() => setShowAnswerBox(true)}
            className="mt-4 w-full border rounded-full py-3 flex items-center gap-1 justify-center text-gray-500 transition-all hover:bg-gray-100"
          >
            <PenLine className="inline w-4 h-4" /> Write your answer
          </button>
        ) : (
          <div className="mt-4">
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="w-full border rounded-xl p-3"
            />
            <button onClick={handlePostAnswer} className="mt-2 px-4 py-2 bg-black text-white rounded-full">
              Post Answer
            </button>
          </div>
        )}

        {/* ANSWERS */}
        {showAllAnswers && (
          <div className="mt-6 space-y-4">
            {answersList.map((answer) => (
              <div key={answer.id} className="bg-gray-50 p-4 rounded-xl">
                <p className="font-semibold">{answer.author.name}</p>
                <p className="text-sm">{answer.content}</p>

                <div className="flex gap-3 mt-2 text-sm">
                  <button onClick={() => handleVoteAnswer(answer.id, 'up')} className="flex items-center gap-1">
                    <ThumbsUp className="inline w-4 h-4" /> Agree ({answer.likes})
                  </button>
                  <button onClick={() => handleVoteAnswer(answer.id, 'down')} className="flex items-center gap-1">
                    <ThumbsDown className="inline w-4 h-4" /> Disagree
                  </button>
                  <button onClick={() => setReplyingTo(answer.id)}>
                    Reply
                  </button>
                </div>

                {replyingTo === answer.id && (
                  <div className="flex gap-2 mt-2">
                    <input
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      className="flex-1 border rounded-full px-3 py-1 text-xs"
                    />
                    <button onClick={() => handleAddReply(answer.id)}>
                      Send
                    </button>
                  </div>
                )}

                {renderReplies(answer.replies || [], answer.id)}
              </div>
            ))}
          </div>
        )}
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postContent={displayQuestion}
        contentType="question"
        contentId={id}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentId={id}
        contentType="question"
      />
    </>
  )
}