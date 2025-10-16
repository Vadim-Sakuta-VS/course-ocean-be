// Min length 8 characters
// The presence of one letter in upper case
// The presence of one letter in lower case
// The presence of one number
// The presence of one special character !#%&-$@.,/\
export const PASSWORD_REGEXP =
  /^(?=.*\p{Ll})(?=.*\p{Lu})(?=.*\d)(?=.*[!#%&\-$@.,_/\\])[\p{L}\d\p{P}\p{S}]{8,}$/u;
